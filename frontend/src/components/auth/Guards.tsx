import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/auth";

/** /conta/* e /checkout exigem sessão; volta para a rota original após o login. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const token = useAuthStore((s) => s.token);
  const location = useLocation();
  if (!token) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  return <>{children}</>;
}

/** /admin/* exige role ADMIN — SELLER/CUSTOMER recebem 403 da API, então a UI nem mostra. */
export function RequireAdmin({ children }: { children: ReactNode }) {
  const token = useAuthStore((s) => s.token);
  const role = useAuthStore((s) => s.role);
  const location = useLocation();
  if (!token) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  if (role !== "ADMIN") {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}
