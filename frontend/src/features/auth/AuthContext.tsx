import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api } from "../../lib/api";
import { clearTokens, getTokens, setTokens } from "../../lib/tokens";

export type Role = "public" | "officer" | "admin";
export interface User {
  id: number;
  email: string;
  full_name: string;
  role: Role;
}
export interface RegisterData {
  email: string;
  password: string;
  full_name: string;
}
interface AuthValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const Ctx = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(() => !!getTokens());

  const refreshUser = useCallback(async () => {
    if (!getTokens()) {
      setUser(null);
      return;
    }
    try {
      setUser(await api<User>("/api/auth/me"));
    } catch {
      clearTokens();
      setUser(null);
    }
  }, []);

  useEffect(() => {
    if (!getTokens()) return;
    let alive = true;
    refreshUser().finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [refreshUser]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api<{ access: string; refresh: string; user: User }>("/api/auth/login", {
      method: "POST",
      body: { email, password },
    });
    setTokens({ access: res.access, refresh: res.refresh });
    setUser(res.user);
  }, []);

  const register = useCallback(
    async (data: RegisterData) => {
      await api("/api/auth/register", { method: "POST", body: data });
      await login(data.email, data.password);
    },
    [login],
  );

  const logout = useCallback(() => {
    clearTokens();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, register, logout, refreshUser }),
    [user, loading, login, register, logout, refreshUser],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthValue {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used within AuthProvider");
  return v;
}
