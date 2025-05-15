import { createContext, useState, useEffect, ReactNode } from "react";
import { User } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<User>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {
    throw new Error("AuthContext not initialized");
  },
  register: async () => {
    throw new Error("AuthContext not initialized");
  },
  logout: async () => {
    throw new Error("AuthContext not initialized");
  },
  updateProfile: async () => {
    throw new Error("AuthContext not initialized");
  },
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const stored = localStorage.getItem("user");
        if (stored) {
          const raw = JSON.parse(stored);
          const localUser = normalizeUser(raw);
          // Refresh from server to get real ObjectId
          try {
            const resp = await apiRequest("GET", `/api/users/${localUser.id}`);
            const freshRaw = await resp.json();
            const freshUser = normalizeUser(freshRaw);
            setUser(freshUser);
            localStorage.setItem("user", JSON.stringify(freshUser));
          } catch (e) {
            console.error("Failed to refresh profile:", e);
            setUser(localUser);
          }
        }
      } catch (error) {
        console.error("Authentication check failed:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Normalize server user object to match User type
  const normalizeUser = (u: any): User => {
    return {
      ...u,
      id: u.id || u._id,
    };
  };

  // Login function
  const login = async (email: string, password: string): Promise<User> => {
    try {
      const response = await apiRequest("POST", "/api/auth/login", {
        email,
        password,
      });
      
      const rawUser = await response.json();
      const userData = normalizeUser(rawUser);
      
      // Store user data
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      
      return userData;
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  // Register function
  const register = async (
    name: string,
    email: string,
    password: string
  ): Promise<User> => {
    try {
      const response = await apiRequest("POST", "/api/auth/register", {
        name,
        email,
        password,
      });
      
      const rawUser = await response.json();
      const userData = normalizeUser(rawUser);
      
      // Store user data
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      
      return userData;
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      // Invalidate session on server
      await apiRequest("POST", "/api/auth/logout");
      // Clear client-side auth
      localStorage.removeItem("user");
      setUser(null);
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
    } catch (error) {
      console.error("Logout failed:", error);
      throw error;
    }
  };

  // Update profile function
  const updateProfile = async (data: Partial<User>): Promise<User> => {
    try {
      if (!user) {
        throw new Error("Not authenticated");
      }
      // Debug: log endpoint and data
      const endpoint = `/api/users/${user.id}`;
      console.log("updateProfile endpoint:", endpoint, data);
      
      const response = await apiRequest("PUT", endpoint, data);
      const rawUpdated = await response.json();
      const updatedUser = normalizeUser(rawUpdated);
      
      // Update stored user data
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      return updatedUser;
    } catch (error) {
      console.error("Profile update failed:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
