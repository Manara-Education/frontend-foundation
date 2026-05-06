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
