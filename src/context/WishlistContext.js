"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import useAuth from "../hooks/useAuth";
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} from "../services/wishlist.service";

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [loading, setLoading] = useState(false);

  // Load wishlist from backend when user logs in
  useEffect(() => {
    if (!isAuthenticated) {
      setWishlistIds(new Set());
      return;
    }
    setLoading(true);
    getWishlist()
      .then((data) => {
        const ids = (data.wishlist || []).map((p) => p._id || p);
        setWishlistIds(new Set(ids));
      })
      .catch(() => setWishlistIds(new Set()))
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  const isWishlisted = useCallback(
    (productId) => wishlistIds.has(productId),
    [wishlistIds]
  );

  const toggleWishlist = useCallback(
    async (productId) => {
      if (!isAuthenticated) return;

      const alreadyWishlisted = wishlistIds.has(productId);

      // Optimistic update
      setWishlistIds((prev) => {
        const next = new Set(prev);
        if (alreadyWishlisted) {
          next.delete(productId);
        } else {
          next.add(productId);
        }
        return next;
      });

      try {
        if (alreadyWishlisted) {
          await removeFromWishlist(productId);
        } else {
          await addToWishlist(productId);
        }
      } catch {
        // Rollback on failure
        setWishlistIds((prev) => {
          const next = new Set(prev);
          if (alreadyWishlisted) {
            next.add(productId);
          } else {
            next.delete(productId);
          }
          return next;
        });
      }
    },
    [isAuthenticated, wishlistIds]
  );

  return (
    <WishlistContext.Provider
      value={{ wishlistIds, isWishlisted, toggleWishlist, loading }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used inside WishlistProvider");
  return ctx;
};
