import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { User } from "@shared/schema";
 
interface AdminAuthContextType {
  admin: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
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

  // Check if admin is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Verify authentication with the server
        const response = await apiRequest("GET", "/api/admin/auth/verify", undefined);
        const data = await response.json();
        
        if (data.isAuthenticated && data.user && data.user.isAdmin) {
          setAdmin(data.user);
          // Also update localStorage for fallback
          localStorage.setItem("admin", JSON.stringify(data.user));
        } else {
          // If not authenticated or not admin, clear local storage
          localStorage.removeItem("admin");
          setAdmin(null);
        }
      } catch (error) {
        console.error("Authentication check failed:", error);
        // Clear local storage on error
        localStorage.removeItem("admin");
        setAdmin(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<User> => {
    try {
      const response = await apiRequest("POST", "/api/admin/auth/login", {
        email,
        password,
      });
      
      const userData = await response.json();
      
      // Verify that the user is an admin
      if (!userData.isAdmin) {
        throw new Error("Not authorized as admin");
      }
      
      // Store admin data for UI purposes
      localStorage.setItem("admin", JSON.stringify(userData));
      setAdmin(userData);
      
      return userData;
    } catch (error) {
      console.error("Admin login failed:", error);
      throw error;
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      // Call the logout endpoint to clear the cookie
      await apiRequest("POST", "/api/admin/auth/logout", {});
      localStorage.removeItem("admin");
      setAdmin(null);
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      // Still clear local state even if server call fails
      localStorage.removeItem("admin");
      setAdmin(null);
      navigate("/login");
    }
  };

  return React.createElement(
    AdminAuthContext.Provider,
    {
      value: {
        admin,
        isAuthenticated: !!admin && admin.isAdmin,
        isLoading,
        login,
        logout,
      },
    },
    children
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  
  if (!context) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  
  return context;
};
