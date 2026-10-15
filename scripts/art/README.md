# Painted valley art (hero)

The hero valley is painted art made with Figma's image models (`generate_image`, model `gemini-3.1-flash-lite-image`,
16 Oct 2026, on Laksh's Figma credits, 16 images). The files the site uses are in `public/art/*.webp`.

How it was made
1. Each piece was generated on a flat pure magenta (#FF00FF) background (skies and the night sky are full frames).
2. `process.py` keys the magenta out (alpha from how magenta each pixel is), removes the pink fringe near edges,
   keeps the biggest blob, trims, and writes WEBP. `valley.py` does the valley (also drops the pink haze near the summit).
   Run them in a folder holding the source JPEGs (`mu.jpg`, `shifts.jpg`, `tower.jpg`, `bestow.jpg`, `range.jpg`, `quay.jpg`,
   `far.jpg`, `clouds.jpg`, `fg.jpg`, `valley.jpg`); needs `pillow`, `numpy`, `opencv-python`. The source JPEGs are not kept
   in git (the Figma download links expire after 7 days); `public/art` is the keeper.
3. Layout lives in `src/world/Painted.jsx` (scene units, 1600 x 900) and the pins / hot zones in `src/world/Hero.jsx`.
   Set `PAINTED = false` in `Hero.jsx` to get the old hand-drawn SVG valley back.

Prompts (shared style: "hand-painted gouache storybook illustration, soft painterly brush texture, saturated warm
colours, warm afternoon light from the upper right"; pieces end with "stands alone, centred, on a perfectly flat solid pure
magenta #FF00FF background, no ground, no shadow, no sky, no people, no text")
- sky-day: clear morning sky, blue to warm peach, a few big painted clouds, only sky.
- sky-night: indigo to violet, many small stars, large soft full moon upper right, thin night clouds.
- valley: river valley, left grassy hill, right taller hill with a ghat of sand-coloured steps down its left slope,
  turquoise river across the lower third, no buildings or people, sky flat magenta.
- far: hazy skyline of an old Indian riverside town (shikhara spires, domes, chhatris) in lilac, on magenta.
- clouds: five separate fluffy clouds on magenta.
- fg: lush leaf and fern clumps in the bottom-left and bottom-right corners, magenta elsewhere.
- mu: red-brick Indian college, clock tower, two chhatri wings, front steps.
- shifts: cream two-storey riverside venue, striped awning, three arched doors, blank signboard, rooftop pavilion.
- tower: slender cream lighthouse-like tower with a red dome (no flag).
- bestow: cosy wooden cottage, red roof, chimney, no signs.
- range: low timber clubhouse with veranda, red roof, no targets.
- quay: wide low sandstone riverside platform with three steps.
