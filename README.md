# Wallpaper Roulette

Spin a color wheel, collect hues, and generate gradient wallpapers. Pick how many colors you want (2–5 spins), watch vertical bars fill as you spin, then fuse them into a single gradient and download a 16:9 PNG.

## Features

- **Roulette wheel** — Spin to land on colors; re-spin any slot before generating.
- **Live bars** — Each spin adds a vertical bar (1/3, 1/4, or 1/5 of the image width for 3–5 spins).
- **Fuse animation** — Bars squeeze and blend into one gradient in the same block.
- **Gradient controls** — Randomize direction; download PNG that matches what you see on screen.

## Run locally

```bash
# Install dependencies
npm install

# Dev server (Turbopack)
npm run dev

# If the dev server hangs on compile, use webpack instead:
npm run dev:webpack
```

Open [http://localhost:3000](http://localhost:3000).

## Build

```bash
npm run build
npm start
```

## Tech

- **Next.js 16** (App Router)
- **React 19**
- **Framer Motion** (animations)
- **Tailwind CSS 4**

## License

Private / unlicensed.
