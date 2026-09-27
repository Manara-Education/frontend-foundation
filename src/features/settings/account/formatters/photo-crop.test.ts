import { describe, expect, it } from "vitest";
import { CROP_VIEWPORT, centredCrop, clampCrop, moveCrop, sourceSquare, zoomCrop } from "./photo-crop";

const WIDE = { width: 800, height: 400 };
const V = CROP_VIEWPORT;

describe("photo crop geometry", () => {
  it("starts centred and exactly covering the viewport along the short side", () => {
    const crop = centredCrop(WIDE);
    const square = sourceSquare(crop, WIDE);
    expect(square.size).toBeCloseTo(400);
    expect(square.sy).toBeCloseTo(0);
    expect(square.sx).toBeCloseTo(200);
  });

  it("never lets the image leave a gap in the viewport", () => {
    const crop = moveCrop(centredCrop(WIDE), 10_000, -10_000, WIDE);
    expect(crop.x).toBe(0);
    expect(crop.y).toBeCloseTo(0);
    const other = moveCrop(centredCrop(WIDE), -10_000, 0, WIDE);
    const square = sourceSquare(other, WIDE);
    expect(square.sx + square.size).toBeCloseTo(WIDE.width);
  });

  it("zooms around the centre and stays inside the zoom range", () => {
    const start = centredCrop(WIDE);
    const zoomed = zoomCrop(start, 2, WIDE);
    const before = sourceSquare(start, WIDE);
    const after = sourceSquare(zoomed, WIDE);
    expect(after.size).toBeCloseTo(before.size / 2);
    expect(after.sx + after.size / 2).toBeCloseTo(before.sx + before.size / 2);
    expect(zoomCrop(start, 99, WIDE).zoom).toBe(3);
    expect(clampCrop({ zoom: 0.2, x: 0, y: 0 }, WIDE).zoom).toBe(1);
  });

  it("maps any clamped state to a square fully inside the source image", () => {
    for (const state of [{ zoom: 1.7, x: -123, y: -40 }, { zoom: 3, x: -2000, y: -900 }]) {
      const square = sourceSquare(clampCrop(state, WIDE, V), WIDE, V);
      expect(square.sx).toBeGreaterThanOrEqual(-1e-9);
      expect(square.sy).toBeGreaterThanOrEqual(-1e-9);
      expect(square.sx + square.size).toBeLessThanOrEqual(WIDE.width + 1e-9);
      expect(square.sy + square.size).toBeLessThanOrEqual(WIDE.height + 1e-9);
    }
  });
});
