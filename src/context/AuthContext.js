"use client";

import { createContext, useState, useEffect, useCallback } from "react";
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
import { setAxiosToken, clearAxiosToken, setLogoutCallback } from "../lib/axios";
import { fetchCurrentUser, createOrUpdateUser } from "../services/auth.service";

const googleProvider = new GoogleAuthProvider();

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
   * Login with Google via popup.
   */
  const loginWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    const idToken = await result.user.getIdToken();

    setFirebaseUser(result.user);
    setToken(idToken);
    setAxiosToken(idToken);

    // Create or update user on backend with Google display name
    await createOrUpdateUser({ name: result.user.displayName || "" });

    const data = await fetchCurrentUser();
    setBackendUser(data.user);

    return data.user;
  };

  /**
   * Register with email and password.
   * Automatically sends email verification.
   */
  const register = async (email, password, name) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const idToken = await userCredential.user.getIdToken();

    setFirebaseUser(userCredential.user);
    setToken(idToken);
    setAxiosToken(idToken);

    await createOrUpdateUser({ name });

    // Send verification email automatically
    await sendEmailVerification(userCredential.user);

    const data = await fetchCurrentUser();
    setBackendUser(data.user);

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
