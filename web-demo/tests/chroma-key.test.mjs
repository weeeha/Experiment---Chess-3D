import test from 'node:test';
import assert from 'node:assert/strict';
import { removeGreenScreen } from '../modern/rendered/chroma-key.js';

test('green-screen sprite rendering removes the background while preserving heraldic colors and neutral materials', () => {
  const colors = [200, 25, 45, 255, 25, 65, 180, 255, 235, 230, 210, 255, 165, 170, 178, 255, 230, 175, 45, 255];
  const pixels = new Uint8ClampedArray([0, 255, 0, 255, 5, 246, 7, 255, ...colors]);
  removeGreenScreen(pixels);
  assert.equal(pixels[3], 0);
  assert.equal(pixels[7], 0);
  assert.deepEqual([...pixels.slice(8)], colors);
});

test('sprite edges become partially transparent with green spill suppressed and existing alpha preserved', () => {
  const pixels = new Uint8ClampedArray([95, 150, 110, 255, 95, 150, 110, 100, 200, 30, 30, 0]);
  removeGreenScreen(pixels);
  assert(pixels[3] > 0 && pixels[3] < 255);
  assert(pixels[1] <= Math.max(pixels[0], pixels[2]) + 10);
  assert(pixels[7] > 0 && pixels[7] < 100);
  assert.equal(pixels[11], 0);
});
