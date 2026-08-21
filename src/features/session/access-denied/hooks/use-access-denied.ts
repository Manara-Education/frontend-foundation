import { useNavigate } from "react-router";
import { useAuth } from "@/shared/auth";

export function useAccessDenied() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return { handleLogout };
}
