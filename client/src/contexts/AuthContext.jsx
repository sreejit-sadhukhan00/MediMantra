"use client";

import React, { createContext, useState, useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-hot-toast";

// Create context
const AuthContext = createContext();

// Custom hook to use auth context
export const useAuth = () => useContext(AuthContext);

// API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem("accessToken");
      
      if (storedToken) {
        try {
          // Set default auth header  
          axios.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
          
          // Fetch current user
          const { data } = await axios.get(`${API_URL}/auth/current-user`);
          
          setUser(data.user || data.data);
          setToken(storedToken);
        } catch (error) {
          console.error("Auth check error:", error);
          
          // If token is invalid or expired, try to refresh
          const refreshToken = localStorage.getItem("refreshToken");
          if (refreshToken) {
            try {
              await refreshAccessToken(refreshToken);
            } catch (refreshError) {
              // Clear auth state if refresh fails
              localStorage.removeItem("accessToken");
              localStorage.removeItem("refreshToken");
              delete axios.defaults.headers.common["Authorization"];
            }
          }
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Register patient
  const register = async (userData) => {
    try {
      setLoading(true);
      const { data } = await axios.post(`${API_URL}/auth/register`, userData);
      
      // Store tokens
      if (data.accessToken) {
        localStorage.setItem("accessToken", data.accessToken);
        if (data.refreshToken) {
          localStorage.setItem("refreshToken", data.refreshToken);
        }
        axios.defaults.headers.common["Authorization"] = `Bearer ${data.accessToken}`;
      }
      
      // Set user if available
      if (data.patient || data.user) {
        setUser(data.patient || data.user);
        setToken(data.accessToken);
      }
      
      return data;
    } catch (error) {
      const message = error.response?.data?.message || "Registration failed";
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  // Register doctor - specific function for doctor registration
  const registerDoctor = async (doctorData) => {
    try {
      setLoading(true);
      const { data } = await axios.post(`${API_URL}/auth/doctor/register`, doctorData);
      
      // Store tokens
      if (data.accessToken) {
        localStorage.setItem("accessToken", data.accessToken);
        if (data.refreshToken) {
          localStorage.setItem("refreshToken", data.refreshToken);
        }
        axios.defaults.headers.common["Authorization"] = `Bearer ${data.accessToken}`;
      }
      
      // Set user if available
      if (data.user) {
        setUser({
          ...data.user,
          doctorProfile: data.doctorProfile
        });
        setToken(data.accessToken);
      }
      
      return data;
    } catch (error) {
      const message = error.response?.data?.message || "Doctor registration failed";
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  // Login user (patient)
  const login = async (credentials) => {
    try {
      setLoading(true);
      
      const { data } = await axios.post(`${API_URL}/auth/login`, credentials);
      
     
      
      setUser(data.patient || data.user);
      setToken(data.token);
      localStorage.setItem("accessToken", data.token);
      
      localStorage.setItem("UserId", data.userId);
       // Store tokens
       if (data.accessToken) {
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("UserId", data.user._id);
        if (data.refreshToken) {
          localStorage.setItem("refreshToken", data.refreshToken);
        }
        axios.defaults.headers.common["Authorization"] = `Bearer ${data.accessToken}`;
      }
      
      return data;
    } catch (error) {
      const message = error.response?.data?.message || "Login failed";
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  // Login doctor - specific function for doctor login
  const loginDoctor = async (credentials) => {
    try {
      setLoading(true);
      
      const { data } = await axios.post(`${API_URL}/auth/doctor/login`, credentials);
      
      // Store tokens
      if (data.token) {
        localStorage.setItem("accessToken", data.token);
        localStorage.setItem("doctorId", data.user._id);
        if (data.refreshToken) {  
          localStorage.setItem("refreshToken", data.refreshToken);
        }
        axios.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
      }
      
      // Set user with doctor profile data
      setUser({
        ...data.user,
        doctorProfile: data.doctorProfile
      });
      setToken(data.token);
      
      return data;
    } catch (error) {
      const message = error.response?.data?.message || "Doctor login failed";
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = async () => {
    try {
      setLoading(true);
      
      // Call API to invalidate token on server
      if (token) {
        await axios.post(`${API_URL}/auth/logout`);
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear state and storage
      setUser(null);
      setToken(null);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      delete axios.defaults.headers.common["Authorization"];
      setLoading(false);
      
      // Redirect to login
      router.push("/login");
    }
  };

  // Complete doctor profile - for doctors after registration
  const completeDoctorProfile = async (profileData) => {
    try {
      setLoading(true);
      const { data } = await axios.put(`${API_URL}/auth/doctor/complete-profile`, profileData);
      
      // Update user state with doctor profile
      setUser(prevUser => ({
        ...prevUser,
        doctorProfile: data.data
      }));
      
      return data;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to complete doctor profile";
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  // Upload verification documents - for doctors
  const uploadVerificationDocs = async (documents) => {
    try {
      setLoading(true);
      
      const formData = new FormData();
      
      // Append each file to form data
      if (Array.isArray(documents)) {
        documents.forEach((file, index) => {
          formData.append(`documents[${index}]`, file);
        });
      } else {
        // Single file upload
        formData.append('document', documents);
      }
      
      const { data } = await axios.post(`${API_URL}/auth/doctor/verification-documents`, 
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      // Update user state with verification documents
      setUser(prevUser => ({
        ...prevUser,
        doctorProfile: {
          ...prevUser.doctorProfile,
          verificationDocuments: data.data
        }
      }));
      
      return data;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to upload verification documents";
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  // Refresh access token
  const refreshAccessToken = async (refreshToken) => {
    try {
      setLoading(true);
      const { data } = await axios.post(`${API_URL}/auth/refresh-token`, { refreshToken });
      
      // Store new access token
      localStorage.setItem("accessToken", data.accessToken);
      axios.defaults.headers.common["Authorization"] = `Bearer ${data.accessToken}`;
      
      setToken(data.accessToken);
      
      return data;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to refresh token";
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  // All other auth functions remain the same...
  // Password reset request
  const forgotPassword = async (email) => {
    try {
      setLoading(true);
      const { data } = await axios.post(`${API_URL}/auth/forgot-password`, { email });
      return data;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to send reset link";
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  // Reset password with token
  const resetPassword = async (token, password) => {
    try {
      setLoading(true);
      const { data } = await axios.post(`${API_URL}/auth/reset-password`, { token, password });
      return data;
    } catch (error) {
      const message = error.response?.data?.message || "Password reset failed";
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  // Change password
  const changePassword = async (currentPassword, newPassword) => {
    try {
      setLoading(true);
      const { data } = await axios.put(`${API_URL}/auth/change-password`, {
        currentPassword,
        newPassword
      });
      return data;
    } catch (error) {
      const message = error.response?.data?.message || "Password change failed";
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  // Verify email
  const verifyEmail = async (token) => {
    try {
      setLoading(true);
      const { data } = await axios.post(`${API_URL}/auth/verify-email`, { token });
      return data;
    } catch (error) {
      const message = error.response?.data?.message || "Email verification failed";
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  // Resend verification email
  const resendVerificationEmail = async (email) => {
    try {
      setLoading(true);
      const { data } = await axios.post(`${API_URL}/auth/resend-verification-email`, { email });
      return data;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to resend verification email";
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  // Verify phone number
  const verifyPhone = async (phone, otp) => {
    try {
      setLoading(true);
      const { data } = await axios.post(`${API_URL}/auth/verify-phone`, { phone, otp });
      return data;
    } catch (error) {
      const message = error.response?.data?.message || "Phone verification failed";
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  // Get current user profile
  const getCurrentUser = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API_URL}/auth/current-user`);
      setUser(data.user || data.data);
      localStorage.setItem("UserId", data.user._id);
      return data;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to get user profile";
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        isDoctor: user?.role === 'doctor',
        register,
        registerDoctor,
        login,
        loginDoctor,
        logout,
        refreshAccessToken,
        forgotPassword,
        resetPassword,
        changePassword,
        verifyEmail,
        resendVerificationEmail,
        verifyPhone,
        getCurrentUser,
        completeDoctorProfile,
        uploadVerificationDocs
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;