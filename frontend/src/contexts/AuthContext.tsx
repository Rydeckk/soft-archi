import type { CreateUser, User } from "@/lib/types/api/User";
import { ApiException } from "@/services/api/ApiException";
import { AuthService } from "@/services/auth/AuthService";
import { UserService } from "@/services/user/UserService";
import { createContext, useState, useEffect, useMemo } from "react";
import type { ReactNode } from "react";
import { toast } from "sonner";
import { USER_ROLE } from "@/lib/enums/UserRole";

interface AuthContextType {
  user: User | null;
  users: User[];
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  createUser: (data: CreateUser) => Promise<void>;
  deleteUser: (id: string) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const authService = useMemo(() => new AuthService(), []);
  const userService = useMemo(() => new UserService(), []);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!user || user.role !== USER_ROLE.SECRETARY) return;
    const getUsers = async () => {
      try {
        const allUsers = await userService.findAll();
        setUsers(allUsers);
      } catch (error) {
        if (error instanceof ApiException) {
          toast.error(error.message);
        }
      }
    };
    getUsers();
  }, [userService, user]);

  const login = async (email: string, password: string) => {
    try {
      const { accessToken, user } = await authService.login({
        email,
        password,
      });
      setUser(user);
      localStorage.setItem("token", accessToken);
      localStorage.setItem("user", JSON.stringify(user));
    } catch (error) {
      if (error instanceof ApiException) {
        toast.error(error.message);
      }
    }
  };

  const logout = () => {
    setUser(null);
    setUsers([]);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  const createUser = async (data: CreateUser) => {
    try {
      const newUser = await userService.create(data);
      setUsers((prev) => [...prev, newUser]);
    } catch (error) {
      if (error instanceof ApiException) {
        toast.error(error.message);
      }
    }
  };

  const deleteUser = async (id: string) => {
    try {
      await userService.delete(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      if (user?.id === id) {
        logout();
      }
    } catch (error) {
      if (error instanceof ApiException) {
        toast.error(error.message);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        users,
        login,
        logout,
        createUser,
        deleteUser,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
