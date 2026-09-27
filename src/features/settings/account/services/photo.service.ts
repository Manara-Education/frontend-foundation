import { CROP_OUTPUT, sourceSquare, type CropState, type ImageSize } from "../formatters/photo-crop";

export const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const PHOTO_MAX_BYTES = 5 * 1024 * 1024;
export const PHOTO_MIN_SIDE = 100;

export interface LoadedPhoto extends ImageSize {
  url: string;
}

/**
 * Checks what can be checked before decoding, then decodes the file in the browser to learn its
 * size. The server repeats every check on the bytes it receives; these exist to answer quickly.
 * Returns the problem as a message, or the decoded photo (whose object URL the caller revokes).
 */
export async function loadPhoto(file: File): Promise<LoadedPhoto | { error: string }> {
  if (!(PHOTO_TYPES as readonly string[]).includes(file.type)) {
    return { error: "صيغة الملف غير مدعومة. استخدم صورة JPG أو PNG أو WebP." };
  }
  if (file.size > PHOTO_MAX_BYTES) return { error: "حجم الصورة أكبر من 5 ميجابايت." };

  const url = URL.createObjectURL(file);
  try {
    const size = await new Promise<ImageSize>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
      image.onerror = () => reject(new Error("decode"));
      image.src = url;
    });
    if (size.width < PHOTO_MIN_SIDE || size.height < PHOTO_MIN_SIDE) {
      URL.revokeObjectURL(url);
      return { error: `الصورة صغيرة جدًا. استخدم صورة لا تقل عن ${PHOTO_MIN_SIDE} × ${PHOTO_MIN_SIDE} بكسل.` };
    }
    return { url, ...size };
  } catch {
    URL.revokeObjectURL(url);
    return { error: "تعذّرت قراءة الصورة. جرّب ملفًا آخر." };
  }
}

/**
 * Draws the chosen square at 512×512 and encodes it as JPEG. The server crops and re-encodes
 * again whatever it receives, so this is a convenience for the person, not a guarantee.
 */
export async function renderCrop(photo: LoadedPhoto, crop: CropState): Promise<Blob> {
  const image = new Image();
  image.src = photo.url;
  await image.decode();
  const canvas = document.createElement("canvas");
  canvas.width = CROP_OUTPUT;
  canvas.height = CROP_OUTPUT;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("canvas");
  // JPEG has no transparency; a transparent PNG would otherwise turn black.
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, CROP_OUTPUT, CROP_OUTPUT);
  context.imageSmoothingQuality = "high";
  const { sx, sy, size } = sourceSquare(crop, photo);
  context.drawImage(image, sx, sy, size, size, 0, 0, CROP_OUTPUT, CROP_OUTPUT);
  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("encode"))), "image/jpeg", 0.9),
  );
}
