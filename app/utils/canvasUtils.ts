import { hslToHex } from './colorGenerator';

export function generateGradientDataUrl(
  colors: string[],
  width = 1920,
  height = 1080,
  angleDeg = 135
): string {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // Match CSS linear-gradient: same angle (0deg = to top) and same line length (through box)
  // Gradient line through center; endpoints = intersections with rectangle boundary
  const rad = (angleDeg * Math.PI) / 180;
  const cx = width / 2;
  const cy = height / 2;
  const sin = Math.sin(rad);
  const cos = Math.cos(rad);
  // Line: (cx + t*sin, cy - t*cos). Find t where it hits the rectangle edges.
  const candidates: number[] = [];
  if (Math.abs(sin) > 1e-9) {
    candidates.push(-cx / sin, (width - cx) / sin);
  }
  if (Math.abs(cos) > 1e-9) {
    candidates.push(cy / cos, (cy - height) / cos);
  }
  const onRect = (t: number) => {
    const x = cx + t * sin;
    const y = cy - t * cos;
    return x >= 0 && x <= width && y >= 0 && y <= height;
  };
  const valid = candidates.filter(onRect);
  const t0 = Math.min(...valid);
  const t1 = Math.max(...valid);
  const x0 = cx + t0 * sin;
  const y0 = cy - t0 * cos;
  const x1 = cx + t1 * sin;
  const y1 = cy - t1 * cos;

  const gradient = ctx.createLinearGradient(x0, y0, x1, y1);

  colors.forEach((color, i) => {
    const stop = colors.length === 1 ? 0 : i / (colors.length - 1);
    gradient.addColorStop(stop, hslToHex(color));
  });

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  return canvas.toDataURL('image/png');
}

// Hex helpers used only for mesh gradient canvas rendering
function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b]
    .map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0'))
    .join('');
}

function averageHex(hexColors: string[]): string {
  const rgbs = hexColors.map(hexToRgb);
  const avg = [0, 1, 2].map(i => rgbs.reduce((s, c) => s + c[i], 0) / rgbs.length);
  return rgbToHex(avg[0], avg[1], avg[2]);
}

function shiftBrightness(hex: string, delta: number): string {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex(r + delta, g + delta, b + delta);
}

// Mirrors the 4-blob layout used in the CSS MeshGradient component
const CANVAS_BLOB_POSITIONS = [
  { cx: 0.15, cy: 0.2,  rx: 0.48, ry: 0.65, opacity: 0.88 },
  { cx: 0.88, cy: 0.3,  rx: 0.44, ry: 0.60, opacity: 0.78 },
  { cx: 0.3,  cy: 0.88, rx: 0.42, ry: 0.58, opacity: 0.82 },
  { cx: 0.82, cy: 0.82, rx: 0.38, ry: 0.50, opacity: 0.72 },
];

function buildBlobColors(hexColors: string[]): string[] {
  return CANVAS_BLOB_POSITIONS.map((_, i) => hexColors[i % hexColors.length]);
}

export function generateMeshGradientDataUrl(
  colors: string[],
  width = 1920,
  height = 1080,
  darkBase = false
): string {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  const hexColors = colors.map(hslToHex);
  const blobColors = buildBlobColors(hexColors);

  ctx.fillStyle = darkBase ? '#0e0e0e' : shiftBrightness(averageHex(hexColors), -45);
  ctx.fillRect(0, 0, width, height);

  for (let i = 0; i < CANVAS_BLOB_POSITIONS.length; i++) {
    const pos = CANVAS_BLOB_POSITIONS[i];
    const hex = blobColors[i];
    const absCx = pos.cx * width;
    const absCy = pos.cy * height;
    const absRx = pos.rx * width;
    const absRy = pos.ry * height;
    const radius = Math.max(absRx, absRy);

    // Scale ctx to make the radial gradient elliptical
    ctx.save();
    ctx.translate(absCx, absCy);
    ctx.scale(absRx / radius, absRy / radius);

    const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
    grad.addColorStop(0,   hex + 'e0'); // ~88% at center
    grad.addColorStop(0.5, hex + '99'); // ~60% mid
    grad.addColorStop(1,   hex + '00'); // transparent edge

    ctx.globalAlpha = pos.opacity;
    ctx.fillStyle = grad;
    ctx.fillRect(-radius, -radius, radius * 2, radius * 2);
    ctx.restore();
  }

  ctx.globalAlpha = 1;
  return canvas.toDataURL('image/png');
}

export function downloadGradient(colors: string[], angleDeg?: number): void {
  const angle = angleDeg ?? Math.floor(Math.random() * 360);
  downloadDataUrl(generateGradientDataUrl(colors, 1920, 1080, angle));
}

export function downloadDataUrl(dataUrl: string, filename = 'wallpaper-roulette-bg.png'): void {
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  link.click();
}
