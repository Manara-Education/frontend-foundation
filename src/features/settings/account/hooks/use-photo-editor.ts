import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { ApiError } from "@/shared/api";
import { removeAvatar, uploadAvatar } from "@/features/profile/services/profile.service";
import type { Profile } from "@/features/profile/types/profile.types";
import {
  ZOOM_STEP,
  centredCrop,
  moveCrop,
  zoomCrop,
  type CropState,
} from "../formatters/photo-crop";
import { loadPhoto, renderCrop, type LoadedPhoto } from "../services/photo.service";

export type PhotoStage = "pick" | "crop" | "uploading" | "removing";

const UPLOAD_FAILED = "تعذّر رفع الصورة. تحقّق من اتصالك ثم حاول مرة أخرى.";
const REMOVE_FAILED = "تعذّر حذف الصورة. حاول مرة أخرى.";

/**
 * The photo dialog's state: choosing a file, positioning it, and sending or removing it.
 *
 * Only one request is ever in flight, and closing the dialog aborts it. The object URL of the
 * chosen file is revoked whenever the file is replaced or the dialog goes away.
 */
export function usePhotoEditor({ onSaved, onClose }: { onSaved: (profile: Profile) => void; onClose: () => void }) {
  const [stage, setStage] = useState<PhotoStage>("pick");
  const [photo, setPhoto] = useState<LoadedPhoto | null>(null);
  const [crop, setCrop] = useState<CropState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [confirmingRemoval, setConfirmingRemoval] = useState(false);
  const inFlight = useRef<AbortController | null>(null);

  useEffect(() => () => {
    if (photo) URL.revokeObjectURL(photo.url);
  }, [photo]);
  useEffect(() => () => inFlight.current?.abort(), []);

  const busy = stage === "uploading" || stage === "removing";

  const choose = useCallback(async (file: File | null | undefined) => {
    if (!file || busy) return;
    setError(null);
    const loaded = await loadPhoto(file);
    if ("error" in loaded) {
      setError(loaded.error);
      return;
    }
    setPhoto(loaded);
    setCrop(centredCrop(loaded));
    setStage("crop");
  }, [busy]);

  const setZoom = (zoom: number) => photo && crop && setCrop(zoomCrop(crop, zoom, photo));
  const zoomBy = (direction: 1 | -1) => crop && setZoom(crop.zoom + direction * ZOOM_STEP * 2);
  const move = (dx: number, dy: number) => photo && crop && setCrop(moveCrop(crop, dx, dy, photo));
  const reset = () => photo && setCrop(centredCrop(photo));

  const save = async () => {
    if (!photo || !crop || busy) return;
    const controller = new AbortController();
    inFlight.current = controller;
    setStage("uploading");
    setError(null);
    setProgress(0);
    try {
      const image = await renderCrop(photo, crop);
      const profile = await uploadAvatar(image, { signal: controller.signal, onProgress: setProgress });
      onSaved(profile);
      onClose();
    } catch (err) {
      if (controller.signal.aborted) return;
      setStage("crop");
      setError(err instanceof ApiError && err.statusCode === 400 && err.errors[0] ? err.errors[0] : UPLOAD_FAILED);
    } finally {
      inFlight.current = null;
      setProgress(null);
    }
  };

  const remove = async () => {
    if (busy) return;
    if (!confirmingRemoval) {
      setConfirmingRemoval(true);
      return;
    }
    setStage("removing");
    setError(null);
    try {
      onSaved(await removeAvatar());
      onClose();
    } catch {
      setStage(photo ? "crop" : "pick");
      setError(REMOVE_FAILED);
    } finally {
      setConfirmingRemoval(false);
    }
  };

  // Dragging the photo: the pointer is captured so a drag that leaves the circle keeps working.
  const dragFrom = useRef<{ x: number; y: number } | null>(null);
  const dragHandlers = {
    onPointerDown: (event: PointerEvent<HTMLElement>) => {
      if (busy) return;
      event.currentTarget.setPointerCapture(event.pointerId);
      dragFrom.current = { x: event.clientX, y: event.clientY };
    },
    onPointerMove: (event: PointerEvent<HTMLElement>) => {
      if (!dragFrom.current) return;
      move(event.clientX - dragFrom.current.x, event.clientY - dragFrom.current.y);
      dragFrom.current = { x: event.clientX, y: event.clientY };
    },
    onPointerUp: () => {
      dragFrom.current = null;
    },
    onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
      const step = event.shiftKey ? 40 : 10;
      const moves: Record<string, [number, number]> = {
        ArrowLeft: [-step, 0],
        ArrowRight: [step, 0],
        ArrowUp: [0, -step],
        ArrowDown: [0, step],
      };
      const delta = moves[event.key];
      if (!delta) return;
      event.preventDefault();
      move(delta[0], delta[1]);
    },
  };

  const close = () => {
    inFlight.current?.abort();
    onClose();
  };

  const chooseAnother = () => {
    setPhoto(null);
    setCrop(null);
    setError(null);
    setStage("pick");
  };

  return {
    stage,
    photo,
    crop,
    error,
    progress,
    busy,
    confirmingRemoval,
    cancelRemoval: () => setConfirmingRemoval(false),
    choose,
    setZoom,
    zoomBy,
    move,
    reset,
    save,
    remove,
    close,
    chooseAnother,
    dragHandlers,
  };
}
