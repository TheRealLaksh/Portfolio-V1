"""Keys the painted journey art (Figma image models, 16 Oct 2026) out of its flat magenta background and writes
public/art/journey/*.webp. Sources live in scripts/art/src (j-*.png, not kept in git: the Figma links expire after 7
days, so public/art/journey is the keeper). Needs pillow, numpy, opencv-python. Run from the repo root:

    python scripts/art/journey.py
"""
import os
import numpy as np
import cv2
from PIL import Image

SRC = os.path.join('scripts', 'art', 'src')
OUT = os.path.join('public', 'art', 'journey')
os.makedirs(OUT, exist_ok=True)


def load(name):
    return np.asarray(Image.open(os.path.join(SRC, f'j-{name}.png')).convert('RGB')).astype(np.float32)


def key(im):
    """Alpha from the distance to the background colour (sampled from the corners), then unmix the pink fringe."""
    h, w = im.shape[:2]
    k = 12
    corners = np.concatenate([im[:k, :k].reshape(-1, 3), im[:k, -k:].reshape(-1, 3), im[-k:, :k].reshape(-1, 3), im[-k:, -k:].reshape(-1, 3)])
    bg = np.median(corners, axis=0)
    d = np.linalg.norm(im - bg, axis=2)
    alpha = np.clip((d - 38) / 52, 0, 1)
    # the background's own character: it is the colour that is high in red and blue and low in green
    m = np.minimum(im[..., 0], im[..., 2]) - im[..., 1]
    alpha = np.minimum(alpha, np.clip(1 - (m - 40) / 70, 0, 1) + (d > 120))
    a = np.maximum(alpha, 0.04)[..., None]
    rgb = np.where(alpha[..., None] < 1, (im - (1 - alpha[..., None]) * bg) / a, im)
    # any pink left on the edge: pull blue back towards green
    edge = (alpha < 0.98) & (alpha > 0)
    over = np.clip(np.minimum(rgb[..., 0], rgb[..., 2]) - rgb[..., 1], 0, None)
    for c in (0, 2):
        rgb[..., c] = np.where(edge, rgb[..., c] - over * 0.8, rgb[..., c])
    return np.dstack([rgb.clip(0, 255), alpha * 255]).astype(np.uint8)


def keep_blobs(arr, frac=0.02):
    """Drop specks: keep every blob at least `frac` as big as the biggest."""
    mask = (arr[..., 3] > 100).astype(np.uint8)
    n, lab, st, _ = cv2.connectedComponentsWithStats(mask, 8)
    if n <= 2:
        return arr
    big = st[1:, cv2.CC_STAT_AREA].max()
    keep = np.zeros_like(mask)
    for i in range(1, n):
        if st[i, cv2.CC_STAT_AREA] >= big * frac:
            keep |= (lab == i).astype(np.uint8)
    keep = cv2.dilate(keep, np.ones((5, 5), np.uint8))
    out = arr.copy()
    out[..., 3] = out[..., 3] * keep
    return out


def trim(arr, pad=2):
    bb = Image.fromarray(arr[..., 3]).point(lambda v: 255 if v > 8 else 0).getbbox()
    return arr[max(bb[1] - pad, 0):bb[3] + pad, max(bb[0] - pad, 0):bb[2] + pad]


def save(arr, name, maxw, q=84):
    img = Image.fromarray(arr, 'RGBA')
    if img.width > maxw:
        img = img.resize((maxw, round(img.height * maxw / img.width)), Image.LANCZOS)
    img.save(os.path.join(OUT, f'{name}.webp'), 'WEBP', quality=q, method=6)
    print(name, img.size)


# stations: the building alone, trimmed
for n in ('school', 'varanasi', 'hotel', 'cabin', 'campus', 'build'):
    save(trim(keep_blobs(key(load(n)))), n, 1400)

# the train and its wheel
save(trim(keep_blobs(key(load('train')), 0.01)), 'train', 2000)
save(trim(key(load('wheel'))), 'wheel', 400, 88)


# hill strips: sky keyed out, then mirrored end to end so the tile joins seamlessly
def strip(name, maxw_tile):
    a = key(load(name))
    a = a[np.where(a[..., 3].max(axis=1) > 8)[0][0]:]  # drop empty rows above the ridge
    mirrored = np.concatenate([a, a[:, ::-1]], axis=1)
    save(mirrored, name, maxw_tile * 2, 80)


strip('far', 2400)
strip('mid', 2400)
print('done')
