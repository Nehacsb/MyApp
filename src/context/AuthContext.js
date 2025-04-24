import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminMode, setAdminMode] = useState(false); 
  const [adminConfirmed, setAdminConfirmed] = useState(null);
  const [otpSent, setOtpSent] = useState(false); // To track OTP status
  const [otpError, setOtpError] = useState(""); // To manage OTP errors
  const [otp, setOtp] = useState(""); // To store entered OTP

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
      const response = await fetch(`http://192.168.91.19:5000/api/login`, {
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
      // Fetch allowed domains first
      console.log("email:",email);
      const domainResponse = await fetch("http://192.168.91.19:5000/api/admin/authorized_domain");
      const allowedDomains = await domainResponse.json();
      console.log("authorised_emails:",allowedDomains);
  
      //const emailDomain = email.split("@")[1];

      console.log("answer:",allowedDomains.includes(email));
  
      const isAllowed =
        email.endsWith("@iitrpr.ac.in") || allowedDomains.includes(email);
  
      if (!isAllowed) {
        throw new Error("Signup allowed only for emails from @iitrpr.ac.in or authorized domains.");
      }
  
      // Proceed with signup
      const response = await fetch("http://192.168.91.19:5000/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email, password, phoneNumber, gender }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to sign up");
      }
  
      await response.json(); // Just consume the message
  
      setOtpSent(true);
      setIsAdmin(false);
      setAdminMode(false);
      setAdminConfirmed(null);
  
      return "OTP sent successfully, please verify it";
    } catch (error) {
      console.error("Signup Error:", error);
      throw error;
    }
  };
  

  const verifyOTP = async (email, otp) => {
    try {
<<<<<<< HEAD
      const response = await fetch("http://192.168.91.19:5000/api/verify-otp", {
=======
      const response = await fetch("https://myapp-hu0i.onrender.com/api/verify-otp", {
>>>>>>> aa1c7911ba826cb4462882b6a72a8d72d1959d6a
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "OTP verification failed");
      }

      const data = await response.json();
      const { user, token, isAdmin } = data;

      await AsyncStorage.setItem("user", JSON.stringify(user));
      await AsyncStorage.setItem("token", token);
      await AsyncStorage.setItem("isAdmin", JSON.stringify(isAdmin || false));


      setUser(user);
      setIsAdmin(isAdmin);
      setAdminMode(false);
      setAdminConfirmed(isAdmin ? null : false);

      setOtpSent(false);
      setOtp("");
      return "OTP verified successfully";

    } catch (error) {
      console.error("Verify OTP Error:", error);
      setOtpError(error.message || "OTP verification failed");
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
      value={{
        user,
        isLoading,
        isAdmin,
        adminMode,
        adminConfirmed,
        setAdminConfirmed,
        setAdminMode,
        setUser,
        otpSent,
        otpError,
        otp,
        setOtp,
        setOtpSent,
        setOtpError,
        login,
        logout,
        signup,
        verifyOTP,
      }}
    >
      {!isLoading && children}
    </AuthContext.Provider>
  );
};
