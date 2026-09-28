// Convert the generated green-screen atlas to transparent pixels when rendering.
export function removeGreenScreen(pixels) {
  for (let i = 0; i < pixels.length; i += 4) {
    const neutral = Math.max(pixels[i], pixels[i + 2]);
    const excess = pixels[i + 1] - neutral;
    if (excess <= 10) continue;
    const opacity = 1 - Math.min(1, (excess - 10) / 70);
    pixels[i + 3] = Math.round(pixels[i + 3] * opacity);
    pixels[i + 1] = Math.min(pixels[i + 1], neutral + 10);
  }
  return pixels;
}
