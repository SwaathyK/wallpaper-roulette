// Generate 20 equally-spaced hues for the roulette wheel segments
export const WHEEL_COLORS: string[] = Array.from({ length: 20 }, (_, i) => {
  const hue = (i * 360) / 20;
  return `hsl(${hue}, 75%, 60%)`;
});

// Convert HSL string to hex for canvas compatibility
export function hslToHex(hsl: string): string {
  const match = hsl.match(/hsl\((\d+(?:\.\d+)?),\s*(\d+)%,\s*(\d+)%\)/);
  if (!match) return hsl;

  const h = parseFloat(match[1]) / 360;
  const s = parseFloat(match[2]) / 100;
  const l = parseFloat(match[3]) / 100;

  let r: number, g: number, b: number;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// Pick a color from wheel based on final rotation angle
export function colorFromAngle(rotationDeg: number, colors: string[]): string {
  const segmentAngle = 360 / colors.length;
  // Normalize rotation to 0-360
  const normalized = ((rotationDeg % 360) + 360) % 360;
  // The pointer is at the top (0°), so we invert
  const pointerAngle = (360 - normalized) % 360;
  const index = Math.floor(pointerAngle / segmentAngle) % colors.length;
  return colors[index];
}

// Get a display-friendly hex label
export function colorLabel(hsl: string): string {
  return hslToHex(hsl).toUpperCase();
}
