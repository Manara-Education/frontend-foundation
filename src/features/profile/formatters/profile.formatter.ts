const ROLE_LABELS: Record<string, string> = {
  STUDENT: "طالب نشط",
  ADMIN: "مسؤول",
  INSTRUCTOR: "معلم",
};

export function formatMemberSince(iso: string): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("ar-EG", {
    month: "long",
    year: "numeric",
  });
}

export function getRoleBadge(role: string): string {
  return ROLE_LABELS[role] ?? role;
}

/** A day, for "last changed" lines. `null` stays `null`: an unknown date is not rendered. */
export function formatChangedOn(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("ar-EG", { day: "numeric", month: "long", year: "numeric" });
}
