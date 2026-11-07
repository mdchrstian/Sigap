import type { ReactNode } from "react";
import { useAuth, type Role } from "./AuthContext";

export default function RequireRole({ roles, children }: { roles: Role[]; children: ReactNode }) {
  const { user } = useAuth();
  if (!user || !roles.includes(user.role)) {
    return <p role="alert" className="text-lg font-semibold">Akses ditolak</p>;
  }
  return <>{children}</>;
}
