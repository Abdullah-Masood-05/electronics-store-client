"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { message } from "antd";
import useAuth from "../hooks/useAuth";
import {
  getCart as fetchCart,
  saveCart as syncCart,
  emptyCart as clearBackendCart,
} from "../services/cart.service";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch cart on auth
  useEffect(() => {
    if (authLoading || !isAuthenticated) return;
    setLoading(true);
    fetchCart()
      .then((data) => setCartItems(data.cart || []))
      .catch(() => setCartItems([]))
      .finally(() => setLoading(false));
  }, [isAuthenticated, authLoading]);

  // Sync local cart to backend
  const syncToBackend = useCallback(async (items) => {
    try {
      const payload = items.map((item) => ({
        product: item.product._id || item.product,
        count: item.count,
      }));
      await syncCart(payload);
    } catch {
      // Silent — cart sync failures are non-critical
    }
  }, []);

  const addToCart = useCallback(
    async (product, count = 1) => {
      setCartItems((prev) => {
        const existing = prev.find(
          (item) =>
            (item.product._id || item.product) ===
            (product._id || product)
        );
        let updated;
        if (existing) {
          updated = prev.map((item) =>
            (item.product._id || item.product) ===
            (product._id || product)
              ? { ...item, count: item.count + count }
              : item
          );
        } else {
          updated = [...prev, { product, count, price: product.price }];
        }
        syncToBackend(updated);
        return updated;
      });
      message.success("Added to cart");
    },
    [syncToBackend]
  );

  const removeFromCart = useCallback(
    async (productId) => {
      setCartItems((prev) => {
        const updated = prev.filter(
          (item) => (item.product._id || item.product) !== productId
        );
        syncToBackend(updated);
        return updated;
      });
    },
    [syncToBackend]
  );

  const updateQuantity = useCallback(
    async (productId, count) => {
      if (count < 1) return removeFromCart(productId);
      setCartItems((prev) => {
        const updated = prev.map((item) =>
          (item.product._id || item.product) === productId
            ? { ...item, count }
            : item
        );
        syncToBackend(updated);
        return updated;
      });
    },
    [syncToBackend, removeFromCart]
  );

  const clearCart = useCallback(async () => {
    setCartItems([]);
    try {
      await clearBackendCart();
    } catch {
      // silent
    }
  }, []);

  const cartTotal = cartItems.reduce(
    (sum, item) => sum + (item.price || item.product?.price || 0) * item.count,
    0
  );

  const cartCount = cartItems.reduce((sum, item) => sum + item.count, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartTotal,
        cartCount,
        loading,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};

export default useCart;
