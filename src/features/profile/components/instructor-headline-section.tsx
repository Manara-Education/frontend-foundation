import { HEADLINE_MAX_LENGTH } from "../hooks/use-instructor-headline";

const PRIMARY = "#4E5B92";

interface InstructorHeadlineSectionProps {
  value: string;
  setValue: (value: string) => void;
  status: "loading" | "ready" | "saving" | "error";
  message: { kind: "success" | "error"; text: string } | null;
  tooLong: boolean;
  canSave: boolean;
  save: () => void;
}

/** "السطر التعريفي": plain text shown under the instructor's name on their public course pages. */
export function InstructorHeadlineSection({ value, setValue, status, message, tooLong, canSave, save }: InstructorHeadlineSectionProps) {
  if (status === "error") return null;
  return (
    <section
      aria-labelledby="instructor-headline-title"
      dir="rtl"
      className="flex flex-col gap-3 mt-6"
      style={{ fontFamily: "'Cairo', sans-serif", borderRadius: 18, background: "#ffffff", border: "1.5px solid rgba(78,91,146,0.08)", padding: 20 }}
    >
      <h2 id="instructor-headline-title" style={{ fontWeight: 700, fontSize: 15, color: "#1E2340" }}>السطر التعريفي</h2>
      <p style={{ fontSize: 12.5, color: "#9BA3C4" }}>يظهر تحت اسمك في صفحات دوراتك العامة. نص عادي، حتى {HEADLINE_MAX_LENGTH} حرفًا.</p>
      <label htmlFor="instructor-headline" className="sr-only">السطر التعريفي</label>
      <input
        id="instructor-headline"
        value={value}
        disabled={status !== "ready"}
        onChange={(event) => setValue(event.target.value)}
        placeholder="مثال: مدرّسة رياضيات منذ عشر سنوات"
        aria-invalid={tooLong || undefined}
        aria-describedby="instructor-headline-count"
        className="rounded-xl px-4 py-3 outline-none focus-visible:ring-2 focus-visible:ring-[#4E5B92]"
        style={{ fontSize: 14, border: `1.5px solid ${tooLong ? "#C0392B" : "rgba(78,91,146,0.16)"}` }}
      />
      <div className="flex items-center justify-between gap-3">
        <span id="instructor-headline-count" style={{ fontSize: 12, color: tooLong ? "#C0392B" : "#9BA3C4" }}>
          {value.trim().length} / {HEADLINE_MAX_LENGTH}
        </span>
        <button
          type="button"
          onClick={save}
          disabled={!canSave}
          className="rounded-xl px-5 py-2 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#4E5B92]"
          style={{ fontWeight: 700, fontSize: 13, color: "#fff", background: PRIMARY, border: "none", opacity: canSave ? 1 : 0.5, cursor: canSave ? "pointer" : "not-allowed" }}
        >
          {status === "saving" ? "جارٍ الحفظ…" : "حفظ"}
        </button>
      </div>
      {message && (
        <p role={message.kind === "error" ? "alert" : "status"} style={{ fontSize: 12.5, color: message.kind === "error" ? "#C0392B" : "#1B7A43" }}>
          {message.text}
        </p>
      )}
    </section>
  );
}
