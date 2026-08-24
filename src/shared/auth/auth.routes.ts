import { paths, resolvePostLoginPath } from "@/shared/navigation/paths";
import type { AuthUser } from "./auth.types";

/**
 * Where a signed-in user belongs, once the account's own state has had its say.
 *
 * `resolvePostLoginPath` answers this from the role and the remembered destination. One
 * thing outranks both: an account the server has flagged as owing a password change is
 * entitled to the password screen and nowhere else, however deep the link it arrived on.
 *
 * Kept next to the auth state rather than in the navigation module because the flag is
 * auth state — `paths.ts` deals in roles and path strings and has no business knowing
 * what a `requiresPasswordReset` is. Kept out of the guards because three callers ask
 * this question (both sign-in paths and `PublicOnlyRoute`), and three copies of the
 * answer is how one of them ends up out of date.
 */
export function postAuthPath(
  user: AuthUser | null | undefined,
  from?: string | null,
): string {
  if (user?.requiresPasswordReset) return paths.resetPassword;
  return resolvePostLoginPath(user?.role, from);
}
