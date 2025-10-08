"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface User {
  id: string;
  name: string;
  email: string;
  userName: string;
  role: string;
  profileImage?: string;
}

interface Project {
  id: number;
  id_user: number;
  title: string;
  percentage: number | null;
  content: string | null;
  project_name: string;
  created_at: string;
}

interface Permission {
  component: string;
  can_view: boolean;
}

interface AuthContextType {
  user: User | null | undefined;
  setUser: React.Dispatch<React.SetStateAction<User | null | undefined>>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;

  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  fetchProjects: () => Promise<void>;

  permissions: Permission[];
  setPermissions: React.Dispatch<React.SetStateAction<Permission[]>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [projects, setProjects] = useState<Project[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/profile`, {
          credentials: "include",
        });
        if (!res.ok) {
          setUser(null);
          setPermissions([]);
          return;
        }
        const data = await res.json();
        setUser(data.user);

        // Obtener permisos si es client
        if (data.user.role === "client") {
          const permsRes = await fetch(
            `${process.env.NEXT_PUBLIC_URL}/api/users/${data.user.id}/apps`
          );
          const permsData = await permsRes.json();
          setPermissions(permsData);
        } else {
          setPermissions([]); // Admin no necesita permisos
        }
      } catch {
        setUser(null);
        setPermissions([]);
      }
    }

    loadUser();
    fetchProjects();
  }, []);
  async function login(email: string, password: string) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/login`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) throw new Error("Invalid credentials");

    const data = await res.json();
    setUser(data.user);
  }

  async function logout() {
    await fetch(`${process.env.NEXT_PUBLIC_URL}/api/logout`, {
      method: "POST",
      credentials: "include",
    });
    setUser(null);
  }

  const fetchProjects = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/projects`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Error al cargar proyectos");
      const data = await res.json();
      setProjects(data);
    } catch (error) {
      console.error("Error al cargar proyectos", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        login,
        logout,
        projects,
        setProjects,
        fetchProjects,
        permissions,
        setPermissions,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
}
