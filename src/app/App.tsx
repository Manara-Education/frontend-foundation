import { RouterProvider } from "react-router";
import { router } from "./routes";
import { AuthProvider } from "@/shared/auth";
import "../styles/fonts.css";

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
