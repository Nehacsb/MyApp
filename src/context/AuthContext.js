import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminMode, setAdminMode] = useState(false); // State to toggle admin mode
  const [adminConfirmed, setAdminConfirmed] = useState(null);
  useEffect(() => {
    const loadUser = async () => {
      try {
        setIsLoading(true);
        const storedUser = await AsyncStorage.getItem("user");
        const storedToken = await AsyncStorage.getItem("token");
        const storedAdmin = await AsyncStorage.getItem("isAdmin");

        if (storedUser && storedToken) {
          setUser(JSON.parse(storedUser));
          setIsAdmin(storedAdmin === "true"); // Convert string to boolean
        }
      } catch (error) {
        console.error("Failed to load user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await fetch(`http://web-production-de29.up.railway.app/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Invalid email or password");
      }

      const data = await response.json();
      const { user, token, isAdmin } = data;

      await AsyncStorage.setItem("user", JSON.stringify(user));
      await AsyncStorage.setItem("token", token);
      await AsyncStorage.setItem("isAdmin", JSON.stringify(isAdmin));

      setUser(user);
      setIsAdmin(isAdmin);
      setAdminConfirmed(isAdmin ? null : false);
      setAdminMode(false); // If user is admin, set admin mode by default
    } catch (error) {
      console.error("Login Error:", error);
      throw error;
    }
  };

  const signup = async (firstName, lastName, email, password, phoneNumber, gender) => {
    try {
      const response = await fetch("http://web-production-de29.up.railway.app/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email, password, phoneNumber, gender }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to sign up");
      }
  
      const data = await response.json();
      const { user, token } = data;
  
      await AsyncStorage.setItem("user", JSON.stringify(user));
      await AsyncStorage.setItem("token", token);
      await AsyncStorage.setItem("isAdmin", JSON.stringify(false)); // ✅ Set isAdmin to false for new users
  
      setUser(user);
      setIsAdmin(false); // ✅ Explicitly set isAdmin state to false
      setAdminMode(false); // ✅ Ensure adminMode is also false for non-admins
      setAdminConfirmed(null);
    } catch (error) {
      console.error("Signup Error:", error);
      throw error;
    }
  };
  
  const logout = async () => {
    try {
      await AsyncStorage.clear();
      setUser(null);
      setIsAdmin(false);
      setAdminConfirmed(null);
      setAdminMode(false); // Reset admin mode on logout
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, isAdmin, adminMode, adminConfirmed, setAdminConfirmed,setAdminMode, login, logout, signup, setUser }}
    >
      {!isLoading && children} 
    </AuthContext.Provider>
  );
};
