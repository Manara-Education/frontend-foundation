import type { CSSProperties } from "react";
import type { CategoriesState } from "../hooks/use-course-categories";
import { FONT } from "./editor-theme";

interface CategoryFieldProps {
  id: string;
  categories: CategoriesState;
  value: number | null;
  onChange: (categoryId: number | null) => void;
  selectStyle: CSSProperties;
}

/**
 * The course's catalogue category. "بدون تصنيف" is always available. A course whose category was
 * retired keeps it, shown as such, until the instructor picks another — saving it back is allowed.
 */
export function CategoryField({ id, categories, value, onChange, selectStyle }: CategoryFieldProps) {
  const list = categories.status === "ready" ? categories.categories : [];
  const current = value != null && !list.some((category) => category.id === value);
  const note =
    categories.status === "error"
      ? "تعذّر تحميل التصنيفات. يمكنك حفظ الدورة دون تغيير التصنيف."
      : categories.status === "ready" && list.length === 0
        ? "لا توجد تصنيفات متاحة بعد."
        : null;
  return (
    <div className="rs-longform" style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
      <label htmlFor={id} style={{ fontFamily: FONT, fontWeight: 600, fontSize: 12.5, color: "#1E2340" }}>
        تصنيف الدورة
      </label>
      <select
        id={id}
        value={value ?? ""}
        disabled={categories.status !== "ready"}
        aria-describedby={note ? `${id}-note` : undefined}
        onChange={(event) => onChange(event.target.value === "" ? null : Number(event.target.value))}
        style={{ ...selectStyle, fontFamily: FONT }}
      >
        <option value="">بدون تصنيف</option>
        {current && <option value={value!}>التصنيف الحالي (لم يعد متاحًا)</option>}
        {list.map((category) => (
          <option key={category.id} value={category.id}>{category.name}</option>
        ))}
      </select>
      {note && (
        <p id={`${id}-note`} style={{ fontFamily: FONT, fontSize: 12, color: "#9BA3C4", margin: 0 }}>{note}</p>
      )}
    </div>
  );
}
