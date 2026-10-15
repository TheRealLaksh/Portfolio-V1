import numpy as np, cv2
from PIL import Image
im = np.asarray(Image.open('valley.jpg').convert('RGB')).astype(np.float32)
H, W = im.shape[:2]
r, g, b = im[..., 0], im[..., 1], im[..., 2]
m = np.minimum(r, b) - g
alpha = np.clip(1 - (m - 28) / 60, 0, 1)
# pink haze near the right summit that is not part of the hill: drop it
yy, xx = np.mgrid[0:H, 0:W]
haze = (yy < 130) & (xx > 1080) & ((r - g) > 14) & ((b - g) > 0)
alpha[haze] = 0
# keep only the big connected landscape (drop floating specks of sky haze)
mask = (alpha > 0.5).astype(np.uint8)
n, lab, st, _ = cv2.connectedComponentsWithStats(mask, 8)
big = 1 + np.argmax(st[1:, cv2.CC_STAT_AREA]); keep = cv2.dilate((lab == big).astype(np.uint8), np.ones((3, 3), np.uint8))
alpha = alpha * keep
# despill every pixel that borders the keyed-out sky
bg = (alpha < 0.5).astype(np.uint8)
band = cv2.dilate(bg, np.ones((15, 15), np.uint8)).astype(bool) & (alpha > 0)
spill = np.clip(np.minimum(r, b) - g, 0, None)
r = np.where(band, r - spill * 0.95, r); b = np.where(band, b - spill * 0.95, b)
# soften the cut edge a touch
alpha = cv2.GaussianBlur(alpha, (0, 0), 0.8)
out = np.dstack([r, g, b, alpha * 255]).clip(0, 255).astype(np.uint8)
img = Image.fromarray(out, 'RGBA').resize((1600, 900), Image.LANCZOS)
img.save('out/valley.webp', 'WEBP', quality=86, method=6)
sky = Image.open('out/sky-day.webp').convert('RGBA'); sky.alpha_composite(img); sky.convert('RGB').crop((900, 0, 1600, 420)).save('valley_tr.png')
print('ok')
