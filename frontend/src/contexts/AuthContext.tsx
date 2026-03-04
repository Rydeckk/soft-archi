import type { CreateUser, User } from "@/lib/types/api/User";
import { ApiException } from "@/services/api/ApiException";
import { AuthService } from "@/services/auth/AuthService";
import { UserService } from "@/services/user/UserService";
import { createContext, useState, useEffect, useMemo } from "react";
import type { ReactNode } from "react";
import { toast } from "sonner";

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
    const updateReduxStore = () => {
      const storedUser = localStorage.getItem("user");
      const storedUsers = localStorage.getItem("all_users");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      if (storedUsers) {
        setUsers(JSON.parse(storedUsers));
      }
      setIsLoading(false);
    };
    updateReduxStore();
  }, []);

  useEffect(() => {
    localStorage.setItem("all_users", JSON.stringify(users));
  }, [users]);

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

  useEffect(() => {
    const getUsers = async () => {
      const allUsers = await userService.findAll();
      setUsers(allUsers);
    };
    getUsers();
  }, [userService, user]);

  const logout = () => {
    setUser(null);
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

  const deleteUser = (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
    if (user?.id === id) {
      logout();
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
