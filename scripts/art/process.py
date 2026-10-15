import numpy as np, json
from PIL import Image
import cv2

def keyed(path, band_px=5, gate=True):
    im = np.asarray(Image.open(path).convert('RGB')).astype(np.float32)
    r, g, b = im[..., 0], im[..., 1], im[..., 2]
    m = np.minimum(r, b) - g
    alpha = np.clip(1 - (m - 30) / 62, 0, 1)
    bg = (alpha < 0.5).astype(np.uint8)
    band = cv2.dilate(bg, np.ones((band_px * 2 + 1, band_px * 2 + 1), np.uint8)).astype(bool) & (alpha > 0)
    spill = np.clip(np.minimum(r, b) - g, 0, None)
    r = np.where(band, r - spill, r); b = np.where(band, b - spill, b)
    # in the band, pull any remaining blue-over-green pink back to neutral
    over = np.clip(b - g, 0, None)
    b = np.where(band, b - over, b)
    return np.dstack([r, g, b, alpha * 255]).clip(0, 255).astype(np.uint8)

def save(arr, name, maxw=None, q=86):
    img = Image.fromarray(arr, 'RGBA')
    if maxw and img.width > maxw:
        img = img.resize((maxw, round(img.height * maxw / img.width)), Image.LANCZOS)
    img.save(f'out/{name}.webp', 'WEBP', quality=q, method=6); print(name, img.size)

def trim(arr, pad=2):
    bb = Image.fromarray(arr[..., 3]).point(lambda v: 255 if v > 8 else 0).getbbox()
    return arr[max(bb[1] - pad, 0):bb[3] + pad, max(bb[0] - pad, 0):bb[2] + pad]

def biggest(arr):
    mask = (arr[..., 3] > 128).astype(np.uint8)
    n, lab, st, _ = cv2.connectedComponentsWithStats(mask, 8)
    if n > 1:
        big = 1 + np.argmax(st[1:, cv2.CC_STAT_AREA]); keep = cv2.dilate((lab == big).astype(np.uint8), np.ones((5, 5), np.uint8))
        arr = arr.copy(); arr[..., 3] = arr[..., 3] * keep
    return arr

# buildings
for nme, src in [('mu', 'mu.jpg'), ('shifts', 'shifts.jpg'), ('tower', 'tower.jpg'), ('bestow', 'bestow.jpg'), ('range', 'range.jpg'), ('quay', 'quay.jpg')]:
    save(trim(biggest(keyed(src))), nme, 900)
# far skyline
f = keyed('far.jpg'); bb = Image.fromarray(f[..., 3]).point(lambda v: 255 if v > 20 else 0).getbbox(); save(f[bb[1]:bb[3]], 'far', 1600, 82)
# clouds: one clean sprite each
c = keyed('clouds.jpg', band_px=6); mask = (c[..., 3] > 100).astype(np.uint8); mask = cv2.dilate(mask, np.ones((9, 9), np.uint8))
nn, lab, st, _ = cv2.connectedComponentsWithStats(mask, 8); k = 0
for i in range(1, nn):
    x, y, w, h, area = st[i]
    if area < 2500: continue
    k += 1
    sub = c[y:y + h, x:x + w].copy(); own = cv2.dilate((lab[y:y + h, x:x + w] == i).astype(np.uint8), np.ones((5, 5), np.uint8)); sub[..., 3] = sub[..., 3] * own
    save(sub, f'cloud-{k}', 640, 86)
# foliage
g = keyed('fg.jpg', band_px=4); mid = g.shape[1] // 2
for nm, part in (('fg-left', g[:, :mid]), ('fg-right', g[:, mid:])):
    save(trim(part), nm, 800, 84)
print('done')
