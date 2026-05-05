"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { HeartFilled, ShoppingCartOutlined, DeleteOutlined } from "@ant-design/icons";
import { useWishlist } from "../../context/WishlistContext";
import useAuth from "../../hooks/useAuth";
import useCart from "../../context/CartContext";
import { getWishlist } from "../../services/wishlist.service";
import AuthGuard from "../../components/AuthGuard";
import "../../styles/wishlist.css";

function WishlistContent() {
  const { wishlistIds, toggleWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) return;
    getWishlist()
      .then((data) => setProducts(data.wishlist || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  // Remove from local list when toggled off
  useEffect(() => {
    setProducts((prev) => prev.filter((p) => wishlistIds.has(p._id)));
  }, [wishlistIds]);

  const handleAddToCart = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
  };

  const handleRemove = (e, productId) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(productId);
  };

  if (loading) {
    return (
      <div className="wl-page">
        <h1 className="wl-title">My Wishlist</h1>
        <div className="wl-grid">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="wl-skeleton" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="wl-page">
      <div className="wl-header">
        <h1 className="wl-title">
          <HeartFilled style={{ color: "#ff6b6b", marginRight: 10, fontSize: 24 }} />
          My Wishlist
        </h1>
        <span className="wl-count">{products.length} item{products.length !== 1 ? "s" : ""}</span>
      </div>

      {products.length === 0 ? (
        <div className="wl-empty">
          <div className="wl-empty-icon">🤍</div>
          <h2>Your wishlist is empty</h2>
          <p>Save items you love and find them here anytime</p>
          <Link href="/products">
            <button className="btn-primary">Browse Products</button>
          </Link>
        </div>
      ) : (
        <div className="wl-grid">
          {products.map((product) => {
            const img = product.images?.[0]?.url || product.images?.[0] || null;
            const avgRating = product.ratings?.length > 0
              ? (product.ratings.reduce((s, r) => s + r.star, 0) / product.ratings.length).toFixed(1)
              : null;

            return (
              <div key={product._id} className="wl-card">
                <Link href={`/products/${product.slug}`} className="wl-card-link">
                  <div className="wl-img-wrap">
                    {img
                      ? <img src={img} alt={product.title} className="wl-img" />
                      : <span className="wl-img-placeholder">📦</span>
                    }
                    <button
                      className="wl-remove-btn"
                      onClick={(e) => handleRemove(e, product._id)}
                      title="Remove from wishlist"
                    >
                      <DeleteOutlined />
                    </button>
                  </div>
                  <div className="wl-card-body">
                    {product.brand && <span className="wl-brand">{product.brand}</span>}
                    <h3 className="wl-product-title">{product.title}</h3>
                    {avgRating && (
                      <div className="wl-rating">
                        ⭐ {avgRating}
                        <span className="wl-rating-count">({product.ratings.length})</span>
                      </div>
                    )}
                    <div className="wl-price-row">
                      <span className="wl-price">${product.price?.toFixed(2)}</span>
                      {product.quantity === 0 && (
                        <span className="wl-out-of-stock">Out of Stock</span>
                      )}
                    </div>
                  </div>
                </Link>
                <button
                  className={`wl-atc-btn ${product.quantity === 0 ? "disabled" : ""}`}
                  onClick={(e) => handleAddToCart(e, product)}
                  disabled={product.quantity === 0}
                >
                  <ShoppingCartOutlined />
                  {product.quantity === 0 ? "Out of Stock" : "Add to Cart"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function WishlistPage() {
  return (
    <AuthGuard>
      <WishlistContent />
    </AuthGuard>
  );
}
