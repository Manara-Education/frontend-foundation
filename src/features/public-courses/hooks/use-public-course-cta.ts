import { useNavigate } from "react-router";
import { postAuthPath, useAuth } from "@/shared/auth";
import { canRoleOpen, paths } from "@/shared/navigation";

/**
 * What the public course page offers the visitor to do next.
 *
 * - `sign-in` — nobody is signed in: sign in, or create an account, and resume at the course.
 * - `continue` — go on to the signed-in course screen. While the session is still being read
 *   this goes by way of the sign-in route, which sends a signed-in visitor straight on; the page
 *   never waits for the session before rendering the course.
 * - `not-for-this-account` — the signed-in account cannot open the student course screen
 *   (an instructor), so there is nowhere to send it.
 */
export type PublicCourseCta =
  | { kind: "sign-in"; onSignIn: () => void; onRegister: () => void }
  | { kind: "continue"; onContinue: () => void }
  | { kind: "not-for-this-account" };

/**
 * Where "buy", "subscribe" or "start" leads from a public course page.
 *
 * Nothing here enrols, charges or grants anything. The destination is the signed-in course
 * screen, which shows the course's real checkout — still behind authentication, still priced
 * by the server, and still subject to the deployment's commerce mode. The remembered
 * destination is a local path built here, and is checked again by `postAuthPath` after sign-in.
 */
export function usePublicCourseCta(courseId: number): PublicCourseCta {
  const { status, user } = useAuth();
  const navigate = useNavigate();
  const destination = paths.student.exploreCourse(courseId);
  const viaSignIn = () => navigate(paths.login, { state: { from: destination } });

  if (status === "loading") return { kind: "continue", onContinue: viaSignIn };

  if (status !== "authenticated" || !user) {
    return {
      kind: "sign-in",
      onSignIn: viaSignIn,
      onRegister: () => navigate(paths.register, { state: { from: destination } }),
    };
  }

  if (!canRoleOpen(user.role, destination)) return { kind: "not-for-this-account" };

  return { kind: "continue", onContinue: () => navigate(postAuthPath(user, destination)) };
}
