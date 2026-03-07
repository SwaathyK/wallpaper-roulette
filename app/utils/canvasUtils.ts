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
