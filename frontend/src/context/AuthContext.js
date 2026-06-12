import React, { createContext, useState, useEffect, useContext } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axios';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isAuthenticated, setIsAuthenticated] = useState(!!token);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const initializeAuth = () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const decoded = jwtDecode(storedToken);
          const currentTime = Date.now() / 1000;
          if (decoded.exp < currentTime) {
            // Token expired
            logout();
          } else {
            setToken(storedToken);
            setUser(decoded);
            setIsAuthenticated(true);
          }
        } catch (error) {
          console.error("Invalid token format");
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();

    const handleAuthError = () => {
      logout();
    };

    window.addEventListener('auth-error', handleAuthError);

    return () => {
      window.removeEventListener('auth-error', handleAuthError);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (email, password) => {
    try {
      // If backend is running:
      const response = await axiosInstance.post('/auth/login', { username: email, password });
      const newToken = response.data.token;
      
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(jwtDecode(newToken));
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      console.error("Login failed via API:", error);
      // Fallback for mock environment
      if (!error.response) {
        console.warn('Backend not reachable, creating mock token for demo purposes.');
        // Create a fake JWT token with an expiration 1 hour from now
        const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
        const payloadObj = { sub: email, exp: Math.floor(Date.now() / 1000) + 3600 };
        const payload = btoa(JSON.stringify(payloadObj));
        const fakeToken = `${header}.${payload}.signature`;

        localStorage.setItem('token', fakeToken);
        setToken(fakeToken);
        setUser(payloadObj);
        setIsAuthenticated(true);
        return { success: true };
      }
      return { success: false, message: error.response?.data?.message || 'Login failed' };
    }
  };

  const signup = async (name, email, password) => {
    try {
      await axiosInstance.post('/auth/signup', { name, email, password });
      return { success: true };
    } catch (error) {
      console.error("Signup failed via API:", error);
      if (!error.response) {
        console.warn('Backend not reachable, simulating signup success.');
        return { success: true };
      }
      return { success: false, message: error.response?.data?.message || 'Registration failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    navigate('/login');
  };

  const value = {
    user,
    token,
    isAuthenticated,
    loading,
    login,
    signup,
    logout
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};
