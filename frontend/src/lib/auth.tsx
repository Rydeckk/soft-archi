import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

export type Role = 'EMPLOYEE' | 'SECRETARY' | 'MANAGER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

interface AuthContextType {
  user: User | null;
  users: User[];
  login: (email: string, role: Role) => void;
  logout: () => void;
  createUser: (data: Omit<User, 'id'>) => void;
  updateUser: (id: string, data: Partial<User>) => void;
  deleteUser: (id: string) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const INITIAL_USERS: User[] = [
  { id: '1', name: 'John Employee', email: 'john@company.com', role: 'EMPLOYEE' },
  { id: '2', name: 'Alice Secretary', email: 'alice@company.com', role: 'SECRETARY' },
  { id: '3', name: 'Bob Manager', email: 'bob@company.com', role: 'MANAGER' },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulation d'une vérification d'authentification au chargement
    const storedUser = localStorage.getItem('user');
    const storedUsers = localStorage.getItem('all_users');
    
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    if (storedUsers) {
      setUsers(JSON.parse(storedUsers));
    }
    setIsLoading(false);
  }, []);

  // Persist users list
  useEffect(() => {
    localStorage.setItem('all_users', JSON.stringify(users));
  }, [users]);

  const login = (email: string, role: Role) => {
    // Check if user already exists in our list
    const existingUser = users.find(u => u.email === email);
    
    if (existingUser) {
      setUser(existingUser);
      localStorage.setItem('user', JSON.stringify(existingUser));
    } else {
      const newUser: User = {
        id: Math.random().toString(36).substring(7),
        name: email.split('@')[0],
        email,
        role,
      };
      setUser(newUser);
      setUsers(prev => [...prev, newUser]);
      localStorage.setItem('user', JSON.stringify(newUser));
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const createUser = (data: Omit<User, 'id'>) => {
    const newUser: User = {
      ...data,
      id: Math.random().toString(36).substring(7),
    };
    setUsers(prev => [...prev, newUser]);
  };

  const updateUser = (id: string, data: Partial<User>) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...data } : u));
    // If updating currently logged in user
    if (user?.id === id) {
      const updated = { ...user, ...data };
      setUser(updated);
      localStorage.setItem('user', JSON.stringify(updated));
    }
  };

  const deleteUser = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
    if (user?.id === id) {
      logout();
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      users, 
      login, 
      logout, 
      createUser, 
      updateUser, 
      deleteUser, 
      isLoading 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
