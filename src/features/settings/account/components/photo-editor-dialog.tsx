import type { DragEvent, KeyboardEvent, PointerEvent } from "react";
import { ImagePlus, Loader2, Minus, Plus, RotateCcw, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/shared/components/dialog";
import type { LoadedPhoto } from "../services/photo.service";
import { CROP_VIEWPORT, MAX_ZOOM, MIN_ZOOM, ZOOM_STEP, scaleOf, type CropState } from "../formatters/photo-crop";
import type { PhotoStage } from "../hooks/use-photo-editor";
import { ActionButton } from "../../components/action-button";
import { DANGER, FAINT, FONT, INK, MUTED, PRIMARY, SURFACE_TINT } from "../../components/settings-tokens";

interface PhotoEditorDialogProps {
  open: boolean;
  hasPhoto: boolean;
  stage: PhotoStage;
  photo: LoadedPhoto | null;
  crop: CropState | null;
  error: string | null;
  progress: number | null;
  busy: boolean;
  confirmingRemoval: boolean;
  cancelRemoval: () => void;
  choose: (file: File | null | undefined) => void;
  setZoom: (zoom: number) => void;
  zoomBy: (direction: 1 | -1) => void;
  reset: () => void;
  save: () => void;
  remove: () => void;
  close: () => void;
  chooseAnother: () => void;
  dragHandlers: {
    onPointerDown: (event: PointerEvent<HTMLElement>) => void;
    onPointerMove: (event: PointerEvent<HTMLElement>) => void;
    onPointerUp: () => void;
    onKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
  };
}

export function PhotoEditorDialog(props: PhotoEditorDialogProps) {
  const { open, hasPhoto, stage, photo, crop, error, progress, busy, close } = props;
  return (
    <Dialog open={open} onOpenChange={(next) => (next ? undefined : close())}>
      <DialogContent
        dir="rtl"
        className="sm:max-w-[560px] max-h-[calc(100dvh-2rem)] overflow-y-auto"
        style={{ fontFamily: FONT }}
        onInteractOutside={(event) => busy && event.preventDefault()}
        onEscapeKeyDown={(event) => busy && event.preventDefault()}
      >
        {/* Clear of the dialog's close button, which the shared primitive pins to the top right. */}
        <DialogTitle style={{ fontWeight: 700, fontSize: 18, color: INK, paddingInlineStart: 28 }}>صورة الملف الشخصي</DialogTitle>
        <DialogDescription style={{ fontSize: 13, color: MUTED }}>
          صورة JPG أو PNG أو WebP، حتى 5 ميجابايت، ولا تقل عن 100 × 100 بكسل.
        </DialogDescription>

        {stage === "pick" ? <DropZone choose={props.choose} /> : null}

        {photo && crop && stage !== "pick" ? (
          <Cropper {...props} photo={photo} crop={crop} />
        ) : null}

        {stage === "uploading" ? (
          <div className="flex flex-col gap-1.5" aria-live="polite">
            <div
              role="progressbar"
              aria-label="تقدّم رفع الصورة"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progress == null ? undefined : Math.round(progress * 100)}
              className="h-1.5 rounded-full overflow-hidden"
              style={{ background: SURFACE_TINT }}
            >
              <div
                className={progress == null ? "h-full w-1/3 animate-pulse" : "h-full"}
                style={{ width: progress == null ? undefined : `${Math.round(progress * 100)}%`, background: PRIMARY, transition: "width 150ms" }}
              />
            </div>
            <span style={{ fontSize: 12, color: FAINT }}>جارٍ رفع الصورة…</span>
          </div>
        ) : null}

        {error ? <p role="alert" style={{ fontSize: 13, color: DANGER }}>{error}</p> : null}

        {props.confirmingRemoval ? (
          <div role="alertdialog" aria-label="تأكيد حذف الصورة" className="flex flex-wrap items-center gap-2 rounded-xl p-3" style={{ background: "rgba(192,57,43,0.06)" }}>
            <span className="flex-1" style={{ fontSize: 13, color: INK }}>حذف صورتك الحالية؟ ستظهر الأحرف الأولى من اسمك بدلًا منها.</span>
            <ActionButton onClick={props.remove} style={{ background: DANGER }} disabled={busy}>حذف</ActionButton>
            <ActionButton variant="secondary" onClick={props.cancelRemoval} disabled={busy}>تراجع</ActionButton>
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-2.5">
          {stage !== "pick" ? (
            <ActionButton onClick={props.save} disabled={busy} aria-busy={stage === "uploading" || undefined}>
              {stage === "uploading" ? <Loader2 size={14} className="animate-spin motion-reduce:animate-none" aria-hidden /> : null}
              حفظ الصورة
            </ActionButton>
          ) : null}
          {stage === "crop" ? (
            <ActionButton variant="secondary" onClick={props.chooseAnother} disabled={busy}>اختيار صورة أخرى</ActionButton>
          ) : null}
          <ActionButton variant="secondary" onClick={close} disabled={stage === "removing"}>إلغاء</ActionButton>
          {hasPhoto && !props.confirmingRemoval ? (
            <button
              type="button"
              onClick={props.remove}
              disabled={busy}
              className="ms-auto inline-flex items-center gap-1.5 rounded-xl px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-[#C0392B]"
              style={{ fontFamily: FONT, fontSize: 12.5, fontWeight: 700, color: DANGER, background: "transparent", border: "none", cursor: busy ? "not-allowed" : "pointer" }}
            >
              {stage === "removing" ? <Loader2 size={14} className="animate-spin motion-reduce:animate-none" aria-hidden /> : <Trash2 size={14} aria-hidden />}
              حذف الصورة
            </button>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DropZone({ choose }: { choose: (file: File | null | undefined) => void }) {
  const onDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    choose(event.dataTransfer.files?.[0]);
  };
  return (
    <label
      onDragOver={(event) => event.preventDefault()}
      onDrop={onDrop}
      className="flex flex-col items-center justify-center gap-2 rounded-2xl px-6 py-10 text-center cursor-pointer focus-within:ring-2 focus-within:ring-[#4E5B92]"
      style={{ border: "2px dashed rgba(78,91,146,0.25)", background: "#FAFBFE" }}
    >
      <span className="flex items-center justify-center rounded-2xl" style={{ width: 52, height: 52, background: SURFACE_TINT, color: PRIMARY }}>
        <ImagePlus size={22} aria-hidden />
      </span>
      <span style={{ fontWeight: 700, fontSize: 14, color: INK }}>اسحب صورة إلى هنا أو اختر ملفًا</span>
      <span style={{ fontSize: 12, color: FAINT }}>JPG · PNG · WebP</span>
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        aria-label="اختيار صورة"
        onChange={(event) => {
          choose(event.target.files?.[0]);
          event.target.value = "";
        }}
      />
    </label>
  );
}

function Cropper(props: PhotoEditorDialogProps & { photo: LoadedPhoto; crop: CropState }) {
  const { photo, crop, busy } = props;
  const scale = scaleOf(photo, crop.zoom);
  const placed = (viewport: number) => {
    const ratio = viewport / CROP_VIEWPORT;
    return {
      position: "absolute" as const,
      left: crop.x * ratio,
      top: crop.y * ratio,
      width: photo.width * scale * ratio,
      height: photo.height * scale * ratio,
      maxWidth: "none",
      userSelect: "none" as const,
      pointerEvents: "none" as const,
    };
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-5">
      {/* Physical coordinates: the crop is geometry, so it is laid out left-to-right. */}
      <div
        dir="ltr"
        tabIndex={busy ? -1 : 0}
        role="group"
        aria-label="موضع الصورة. اسحبها أو استخدم الأسهم لتحريكها"
        {...props.dragHandlers}
        className="relative overflow-hidden rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-[#4E5B92] touch-none"
        style={{ width: CROP_VIEWPORT, height: CROP_VIEWPORT, maxWidth: "100%", background: "#1E2340", cursor: busy ? "default" : "grab", flexShrink: 0 }}
      >
        <img src={photo.url} alt="" draggable={false} style={placed(CROP_VIEWPORT)} />
        {/* The circle the photo will be shown in; everything outside it is dimmed. */}
        <div aria-hidden className="absolute inset-0 rounded-full pointer-events-none" style={{ boxShadow: "0 0 0 999px rgba(30,35,64,0.55)", border: "2px solid rgba(255,255,255,0.8)" }} />
      </div>

      <div className="flex flex-col gap-4 w-full">
        <div className="flex items-end gap-4" aria-label="معاينة">
          <Preview size={96} placed={placed(96)} url={photo.url} />
          <Preview size={40} placed={placed(40)} url={photo.url} />
        </div>
        <div className="flex items-center gap-2">
          <ZoomButton label="تصغير" onClick={() => props.zoomBy(-1)} disabled={busy || crop.zoom <= MIN_ZOOM}>
            <Minus size={14} aria-hidden />
          </ZoomButton>
          <input
            type="range"
            aria-label="تكبير الصورة"
            min={MIN_ZOOM}
            max={MAX_ZOOM}
            step={ZOOM_STEP}
            value={crop.zoom}
            disabled={busy}
            onChange={(event) => props.setZoom(Number(event.target.value))}
            className="flex-1 accent-[#4E5B92]"
            dir="ltr"
          />
          <ZoomButton label="تكبير" onClick={() => props.zoomBy(1)} disabled={busy || crop.zoom >= MAX_ZOOM}>
            <Plus size={14} aria-hidden />
          </ZoomButton>
        </div>
        <button
          type="button"
          onClick={props.reset}
          disabled={busy}
          className="self-start inline-flex items-center gap-1.5 rounded-lg px-2 py-1 outline-none focus-visible:ring-2 focus-visible:ring-[#4E5B92]"
          style={{ fontFamily: FONT, fontSize: 12.5, fontWeight: 700, color: PRIMARY, background: "transparent", border: "none", cursor: "pointer" }}
        >
          <RotateCcw size={13} aria-hidden /> إعادة الضبط
        </button>
      </div>
    </div>
  );
}

function Preview({ size, placed, url }: { size: number; placed: React.CSSProperties; url: string }) {
  return (
    <div dir="ltr" aria-hidden className="relative overflow-hidden rounded-full flex-shrink-0" style={{ width: size, height: size, border: "2px solid #fff", boxShadow: "0 2px 10px rgba(78,91,146,0.2)" }}>
      <img src={url} alt="" draggable={false} style={placed} />
    </div>
  );
}

function ZoomButton({ label, onClick, disabled, children }: { label: string; onClick: () => void; disabled: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="flex items-center justify-center rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-[#4E5B92]"
      style={{ width: 32, height: 32, background: SURFACE_TINT, color: PRIMARY, border: "none", cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1 }}
    >
      {children}
    </button>
  );
}
