import { useLogoutAction } from "@/shared/auth";

export function useAccessDenied() {
  return { handleLogout: useLogoutAction() };
}
