import React, { createContext, useState } from "react";
import axios from "../lib/axios";

export interface UserData {
  username: string;
  apiKey: string;
  role: string;
}

export interface AuthContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  user: UserData;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {

  const isDevelopmentEnvironment: boolean = import.meta.env.VITE_ENVIRONMENT === "development"

  const [isAuthenticated, setIsAuthenticated] = useState(isDevelopmentEnvironment);
  const [user, setUser] = useState<UserData>({
    username: isDevelopmentEnvironment ? "devUser" : "",
    apiKey: isDevelopmentEnvironment ? import.meta.env.VITE_SPACE_ADMIN_API_KEY : "",
    role: isDevelopmentEnvironment ? "ADMIN" : "",
  });

  const login = (username: string, password: string) => {
    return axios
      .post(
        "/users/authenticate",
        { username, password },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      .then((response) => {
        const user = response.data;
        if (user) {
          if (user.role !== "ADMIN" && user.role !== "MANAGER") {
            throw new Error("Unauthorized user. You must be ADMIN or MANAGER to configure SPACE.");
          }else{
            setUser({
              username: user.username,
              apiKey: user.apiKey,
              role: user.role, // This should be replaced with actual roles from the response
            });
            setIsAuthenticated(true);
          }
        } else {
          throw new Error("Authentication failed");
        }
      });
  };

  const logout = () => {
    setUser({
      username: "",
      apiKey: "",
      role: "",
    });
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, user }}>
      {children}
    </AuthContext.Provider>
  );
};
