import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useMemo,
} from "react";
import { publicApi } from "../api/axios";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext(null);

export const useAuth = () => {
  return useContext(AuthContext);
};

// AuthProvider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Function to set tokens and user info after successful login/signup
  const setAuthTokens = (accessToken, refreshToken) => {
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    try {
      const decodedUser = jwtDecode(accessToken);
      setUser(decodedUser);
    } catch (error) {
      console.error("Failed to decode access token:", error);

      logout();
    }
  };

  // check for existing tokens in localStorage
  useEffect(() => {
    const loadUserFromStorage = () => {
      const accessToken = localStorage.getItem("accessToken");
      if (accessToken) {
        try {
          const decodedUser = jwtDecode(accessToken);
          console.log(decodedUser);

          if (decodedUser.exp * 1000 > Date.now()) {
            setUser(decodedUser);
            console.log("User auto-logged in from stored token.");
          } else {
            console.log("Stored access token expired on load. Logging out.");
            logout();
          }
        } catch (error) {
          console.error("Error decoding or validating stored token:", error);
          logout();
        }
      }
      setLoading(false);
    };

    loadUserFromStorage();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      const response = await publicApi.post("/auth/login", { email, password });
      const { accessToken, refreshToken, user: userData } = response.data;

      setAuthTokens(accessToken, refreshToken);
      return { success: true, user: userData };
    } catch (error) {
      console.error("Login failed:", error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || "Login failed.",
      };
    }
  };

  // Signup function (for normal users)
  const signup = async (name, email, password, address) => {
    try {
      const response = await publicApi.post("/auth/signup", {
        name,
        email,
        password,
        address,
      });

      return { success: true, message: response.data.message };
    } catch (error) {
      console.error("Signup failed:", error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || "Signup failed.",
      };
    }
  };

  // Logout function
  const logout = async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (refreshToken) {
      try {
        await publicApi.post("/auth/logout", { refreshToken });
      } catch (error) {
        console.error(
          "Logout failed on server:",
          error.response?.data || error.message
        );
      }
    }
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setUser(null);
    console.log("User logged out.");
  };

  const contextValue = useMemo(
    () => ({
      user,
      loading,
      login,
      signup,
      logout,
      isAuthenticated: !!user,
      isAdmin: user?.role === "system_admin",
      isStoreOwner: user?.role === "store_owner",
      isNormalUser: user?.role === "normal_user",
    }),
    [user, loading]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};
