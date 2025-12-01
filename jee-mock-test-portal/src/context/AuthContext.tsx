import { createContext, useContext, useState, ReactNode } from 'react';
import { UserAccount } from '../types';

const ADMIN_EMAIL = 'admin@jee.com';
const ADMIN_PASSWORD = 'admin123';

const initialAccounts: UserAccount[] = [
  { email: ADMIN_EMAIL, password: ADMIN_PASSWORD, role: 'admin' },
  { email: 'test@gmail.com', password: 'test123', role: 'student' },
];

interface AuthContextType {
  isAuthenticated: boolean;
  currentUser: UserAccount | null;
  accounts: UserAccount[];
  login: (email: string, password: string) => boolean;
  logout: () => void;
  addStudent: (email: string, password: string) => { success: boolean; message: string };
  deleteStudent: (email: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accounts, setAccounts] = useState<UserAccount[]>(initialAccounts);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);

  const login = (email: string, password: string): boolean => {
    const normalizedEmail = email.trim().toLowerCase();
    const user = accounts.find(
      acc => acc.email.toLowerCase() === normalizedEmail && acc.password === password
    );
    if (user) {
      setIsAuthenticated(true);
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  const addStudent = (email: string, password: string): { success: boolean; message: string } => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password.trim()) {
      return { success: false, message: 'Please enter both email and password' };
    }
    if (accounts.some(acc => acc.email.toLowerCase() === normalizedEmail)) {
      return { success: false, message: 'This email already exists' };
    }
    const newStudent: UserAccount = { email: email.trim(), password: password.trim(), role: 'student' };
    setAccounts(prev => [...prev, newStudent]);
    return { success: true, message: `Student ${normalizedEmail} added successfully!` };
  };

  const deleteStudent = (email: string) => {
    setAccounts(prev => prev.filter(acc => acc.email !== email));
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      currentUser,
      accounts,
      login,
      logout,
      addStudent,
      deleteStudent,
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
