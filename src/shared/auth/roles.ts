/**
 * Role identity for the signed-in user.
 *
 * The server sends the role as an upper-case name (`STUDENT`, `INSTRUCTOR`, `ADMIN`).
 * Nothing outside this file should compare `user.role` directly: the app used to test it
 * with `.toUpperCase()` in one place and `.toLowerCase()` in another, which is exactly the
 * kind of drift that lets a role check silently stop matching.
 */

export const ROLES = {
  STUDENT: "STUDENT",
  INSTRUCTOR: "INSTRUCTOR",
  ADMIN: "ADMIN",
} as const;

export type AppRole = (typeof ROLES)[keyof typeof ROLES];

export function normalizeRole(role: string | null | undefined): string {
  return (role ?? "").trim().toUpperCase();
}

export function isInstructorRole(role: string | null | undefined): boolean {
  return normalizeRole(role) === ROLES.INSTRUCTOR;
}

export function isStudentRole(role: string | null | undefined): boolean {
  return normalizeRole(role) === ROLES.STUDENT;
}

/** Case-insensitive membership test, used by the role guard. */
export function hasAnyRole(
  role: string | null | undefined,
  allowed: readonly string[],
): boolean {
  const actual = normalizeRole(role);
  return allowed.some((candidate) => normalizeRole(candidate) === actual);
}
