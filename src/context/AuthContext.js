"use client";

import { createContext, useState, useEffect, useCallback } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "../lib/firebase";
import { setAxiosToken, clearAxiosToken, setLogoutCallback } from "../lib/axios";
import { fetchCurrentUser, createOrUpdateUser } from "../services/auth.service";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [backendUser, setBackendUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * Logout — sign out of Firebase and clear all state.
   */
  const logout = useCallback(async () => {
    try {
      await signOut(auth);
    } catch (err) {
      // Ignore sign-out errors
    }
    setFirebaseUser(null);
    setBackendUser(null);
    setToken(null);
    clearAxiosToken();
  }, []);

  // Register the logout callback for Axios 401 interceptor
  useEffect(() => {
    setLogoutCallback(logout);
    return () => setLogoutCallback(null);
  }, [logout]);

  /**
   * Listen to Firebase auth state changes.
   * On auth state change: get token → fetch backend user.
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const idToken = await user.getIdToken();
          setFirebaseUser(user);
          setToken(idToken);
          setAxiosToken(idToken);

          // Fetch backend user profile
          const data = await fetchCurrentUser();
          setBackendUser(data.user);
        } catch (err) {
          console.error("Failed to fetch backend user:", err);
          setFirebaseUser(user);
          setBackendUser(null);
        }
      } else {
        setFirebaseUser(null);
        setBackendUser(null);
        setToken(null);
        clearAxiosToken();
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  /**
   * Login with email and password.
   */
  const login = async (email, password) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const idToken = await userCredential.user.getIdToken();

    setFirebaseUser(userCredential.user);
    setToken(idToken);
    setAxiosToken(idToken);

    const data = await fetchCurrentUser();
    setBackendUser(data.user);

    return data.user;
  };

  /**
   * Register with email and password.
   */
  const register = async (email, password, name) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const idToken = await userCredential.user.getIdToken();

    setFirebaseUser(userCredential.user);
    setToken(idToken);
    setAxiosToken(idToken);

    await createOrUpdateUser({ name });

    const data = await fetchCurrentUser();
    setBackendUser(data.user);

    return data.user;
  };

  const value = {
    firebaseUser,
    backendUser,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!firebaseUser && !!backendUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
