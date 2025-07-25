import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  permissions: {
    uploadLimit: number | null; // null = unlimited
    downloadLimit: number | null; // null = unlimited
    canAccessReports: boolean;
    canManageUsers: boolean;
  };
  createdAt: string;
  lastLogin?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  users: User[];
  addUser: (userData: Omit<User, 'id' | 'createdAt'>) => void;
  updateUser: (id: string, userData: Partial<User>) => void;
  deleteUser: (id: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users data
const mockUsers: User[] = [
  {
    id: '1',
    name: 'Admin Master',
    email: 'admin@gpt.com',
    role: 'admin',
    permissions: {
      uploadLimit: null,
      downloadLimit: null,
      canAccessReports: true,
      canManageUsers: true,
    },
    createdAt: '2024-01-01T00:00:00Z',
    lastLogin: '2024-01-20T10:30:00Z',
  },
  {
    id: '2',
    name: 'João Silva',
    email: 'joao@email.com',
    role: 'user',
    permissions: {
      uploadLimit: 10, // 10 files per month
      downloadLimit: 50, // 50 downloads per month
      canAccessReports: false,
      canManageUsers: false,
    },
    createdAt: '2024-01-02T00:00:00Z',
    lastLogin: '2024-01-20T09:15:00Z',
  },
  {
    id: '3',
    name: 'Maria Santos',
    email: 'maria@email.com',
    role: 'user',
    permissions: {
      uploadLimit: 5,
      downloadLimit: 25,
      canAccessReports: false,
      canManageUsers: false,
    },
    createdAt: '2024-01-03T00:00:00Z',
    lastLogin: '2024-01-19T14:20:00Z',
  },
];

// Mock credentials
const mockCredentials = {
  'admin@gpt.com': 'admin123',
  'joao@email.com': 'user123',
  'maria@email.com': 'user123',
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(mockUsers);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('gpt-user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check credentials
    if (mockCredentials[email as keyof typeof mockCredentials] === password) {
      const foundUser = users.find(u => u.email === email);
      if (foundUser) {
        const updatedUser = { ...foundUser, lastLogin: new Date().toISOString() };
        setUser(updatedUser);
        localStorage.setItem('gpt-user', JSON.stringify(updatedUser));
        
        // Update user in users array
        setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
        
        return true;
      }
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('gpt-user');
  };

  const addUser = (userData: Omit<User, 'id' | 'createdAt'>) => {
    const newUser: User = {
      ...userData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setUsers(prev => [...prev, newUser]);
  };

  const updateUser = (id: string, userData: Partial<User>) => {
    setUsers(prev => prev.map(user => 
      user.id === id ? { ...user, ...userData } : user
    ));
    
    // Update current user if it's the same user
    if (user?.id === id) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('gpt-user', JSON.stringify(updatedUser));
    }
  };

  const deleteUser = (id: string) => {
    setUsers(prev => prev.filter(user => user.id !== id));
    
    // Logout if current user is deleted
    if (user?.id === id) {
      logout();
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    users,
    addUser,
    updateUser,
    deleteUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};