import React, { createContext, useContext, ReactNode, useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { apiRequest } from "../lib/apiUtils";
import { User } from "../../../shared/schema";

interface AdminAuthContextType {
  admin: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean, data?: User, error?: string }>;
  logout: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType>({
  admin: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {
    throw new Error("AdminAuthContext not initialized");
  },
  logout: async () => {
    throw new Error("AdminAuthContext not initialized");
  },
});

export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
  const [admin, setAdmin] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [, navigate] = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedAdmin = localStorage.getItem("admin");
        if (storedAdmin) {
          // Verify the stored admin with the server
          const response = await apiRequest('/api/admin/auth/verify');
          if (!response.ok) {
            throw new Error('Verification failed');
          }
          const adminData = await response.json();
          if (adminData.isAuthenticated) {
            setAdmin(adminData.user);
          } else {
            throw new Error(adminData.message || 'Not authorized as admin');
          }
        }
      } catch (error) {
        console.error("Authentication check failed:", error);
        localStorage.removeItem("admin");
        setAdmin(null);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean, data?: User, error?: string }> => {
    try {
      const response = await apiRequest('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const userData = await response.json();
      if (!userData.isAdmin) {
        throw new Error('Not authorized as admin');
      }

      localStorage.setItem('admin', JSON.stringify(userData));
      setAdmin(userData);
      return { success: true, data: userData };
    } catch (error: any) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  }, [setAdmin]);

  const logout = useCallback(async (): Promise<void> => {
    try {
      await apiRequest('/api/admin/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error("Logout API call failed:", error);
    } finally {
      localStorage.removeItem("admin");
      setAdmin(null);
      navigate("/admin/login");
    }
  }, [navigate, setAdmin]);

  return (
    <AdminAuthContext.Provider
      value={{ admin, isAuthenticated: !!admin && admin.isAdmin, isLoading, login, logout }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  return context;
};
