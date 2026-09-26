/**
 * The geometry of the circular photo crop, as pure functions.
 *
 * The crop is a square viewport of `viewport` pixels with the image drawn behind it. `x`/`y` are
 * the image's top-left corner relative to the viewport, in viewport pixels; `zoom` multiplies the
 * scale at which the image just covers the viewport. The image may never leave a gap inside the
 * viewport, so every state is clamped.
 */
export const CROP_VIEWPORT = 280;
export const CROP_OUTPUT = 512;
export const MIN_ZOOM = 1;
export const MAX_ZOOM = 3;
export const ZOOM_STEP = 0.1;

export interface CropState {
  zoom: number;
  x: number;
  y: number;
}

export interface ImageSize {
  width: number;
  height: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Viewport pixels per image pixel at the given zoom. */
export function scaleOf(image: ImageSize, zoom: number, viewport = CROP_VIEWPORT): number {
  return (viewport / Math.min(image.width, image.height)) * zoom;
}

export function clampCrop(state: CropState, image: ImageSize, viewport = CROP_VIEWPORT): CropState {
  const zoom = clamp(state.zoom, MIN_ZOOM, MAX_ZOOM);
  const scale = scaleOf(image, zoom, viewport);
  return {
    zoom,
    x: clamp(state.x, viewport - image.width * scale, 0),
    y: clamp(state.y, viewport - image.height * scale, 0),
  };
}

/** The image centred at the given zoom. */
export function centredCrop(image: ImageSize, zoom = MIN_ZOOM, viewport = CROP_VIEWPORT): CropState {
  const scale = scaleOf(image, zoom, viewport);
  return clampCrop(
    { zoom, x: (viewport - image.width * scale) / 2, y: (viewport - image.height * scale) / 2 },
    image,
    viewport,
  );
}

/** Changes the zoom while keeping the point under the viewport's centre where it is. */
export function zoomCrop(state: CropState, zoom: number, image: ImageSize, viewport = CROP_VIEWPORT): CropState {
  const before = scaleOf(image, state.zoom, viewport);
  const target = clamp(zoom, MIN_ZOOM, MAX_ZOOM);
  const after = scaleOf(image, target, viewport);
  const centreX = (viewport / 2 - state.x) / before;
  const centreY = (viewport / 2 - state.y) / before;
  return clampCrop(
    { zoom: target, x: viewport / 2 - centreX * after, y: viewport / 2 - centreY * after },
    image,
    viewport,
  );
}

export function moveCrop(state: CropState, dx: number, dy: number, image: ImageSize, viewport = CROP_VIEWPORT): CropState {
  return clampCrop({ ...state, x: state.x + dx, y: state.y + dy }, image, viewport);
}

/** The square of the source image the viewport shows, in image pixels. */
export function sourceSquare(state: CropState, image: ImageSize, viewport = CROP_VIEWPORT) {
  const scale = scaleOf(image, state.zoom, viewport);
  return { sx: -state.x / scale, sy: -state.y / scale, size: viewport / scale };
}
