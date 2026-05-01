"use client";

import { createContext, useState, useEffect, useCallback, useRef } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  sendEmailVerification,
} from "firebase/auth";
import { auth } from "../lib/firebase";
import api, { setAxiosToken, clearAxiosToken, setLogoutCallback } from "../lib/axios";
import { fetchCurrentUser, createOrUpdateUser } from "../services/auth.service";

const googleProvider = new GoogleAuthProvider();

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [backendUser, setBackendUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const syncPromiseRef = useRef(null);

  /**
   * Logout — sign out of Firebase and clear all state.
   */
  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      console.error("Failed to logout server session", err);
    }
    
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

  const syncBackendUser = useCallback(async (user) => {
    if (!user) {
      setFirebaseUser(null);
      setBackendUser(null);
      setToken(null);
      clearAxiosToken();
      return null;
    }

    if (syncPromiseRef.current) {
      return syncPromiseRef.current;
    }

    syncPromiseRef.current = (async () => {
      const idToken = await user.getIdToken();
      setFirebaseUser(user);
      setToken(idToken);
      setAxiosToken(idToken);

      try {
        let data;
        try {
          data = await fetchCurrentUser({ skipAuthLogout: true });
        } catch (err) {
          if (err?.response?.status === 401) {
            try {
              await api.post("/auth/session");
            } catch (sessionErr) {
              console.error("Failed to register session", sessionErr);
            }
            data = await fetchCurrentUser({ skipAuthLogout: true });
          } else {
            throw err;
          }
        }

        setBackendUser(data.user);
        return data.user;
      } catch (err) {
        setBackendUser(null);
        throw err;
      }
    })();

    try {
      return await syncPromiseRef.current;
    } finally {
      syncPromiseRef.current = null;
    }
  }, []);

  /**
   * Listen to Firebase auth state changes.
   * On auth state change: sync server session and backend user.
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        await syncBackendUser(user);
      } catch (err) {
        if (user) {
          console.error("Failed to fetch backend user:", err);
        }
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [syncBackendUser]);

  /**
   * Login with email and password.
   */
  const login = async (email, password) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return syncBackendUser(userCredential.user);
  };

  /**
   * Login with Google via popup.
   */
  const loginWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    await syncBackendUser(result.user);

    // Create or update user on backend with Google display name
    const data = await createOrUpdateUser({ name: result.user.displayName || "" });
    setBackendUser(data.user);

    return data.user;
  };

  /**
   * Register with email and password.
   * Automatically sends email verification.
   */
  const register = async (email, password, name, role) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await syncBackendUser(userCredential.user);

    const data = await createOrUpdateUser({ name, role });
    setBackendUser(data.user);

    // Send verification email automatically
    await sendEmailVerification(userCredential.user);

    return data.user;
  };

  /**
   * Send password reset email.
   */
  const forgotPassword = async (email) => {
    await sendPasswordResetEmail(auth, email);
  };

  /**
   * Resend email verification to current user.
   */
  const resendVerificationEmail = async () => {
    if (firebaseUser && !firebaseUser.emailVerified) {
      await sendEmailVerification(firebaseUser);
    }
  };

  const value = {
    firebaseUser,
    backendUser,
    token,
    loading,
    login,
    loginWithGoogle,
    register,
    logout,
    forgotPassword,
    resendVerificationEmail,
    isAuthenticated: !!firebaseUser && !!backendUser,
    emailVerified: firebaseUser?.emailVerified ?? false,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
