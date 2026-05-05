"use client";

import { useState } from "react";
import Link from "next/link";
import { StarFilled, HeartOutlined, HeartFilled } from "@ant-design/icons";
import { trackProductClick } from "../services/product.service";
import useCart from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import "./ProductCard.css";

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();

  const avgRating =
    product.ratings?.length > 0
      ? (
          product.ratings.reduce((sum, r) => sum + r.star, 0) /
          product.ratings.length
        ).toFixed(1)
      : null;

  const handleClick = () => {
    trackProductClick(product.slug);
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product._id);
  };

  const discount = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : null;

  return (
    <div className="pc">
      <Link href={`/products/${product.slug}`} className="pc-link" onClick={handleClick}>
        {/* Image */}
        <div className="pc-media">
          {product.images?.[0]?.url ? (
            <img src={product.images[0].url} alt={product.title} className="pc-img" loading="lazy" />
          ) : (
            <div className="pc-placeholder">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.3">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            </div>
          )}

          {/* Wishlist */}
          <button className="pc-wish" onClick={handleWishlist} title="Wishlist">
            {isWishlisted(product._id) ? (
              <HeartFilled style={{ color: "var(--red)" }} />
            ) : (
              <HeartOutlined />
            )}
          </button>

          {/* Badges */}
          <div className="pc-badges">
            {product.shipping && <span className="badge badge-green">Free Shipping</span>}
            {discount && <span className="badge badge-red">-{discount}%</span>}
          </div>
        </div>

        {/* Info */}
        <div className="pc-body">
          {product.brand && <div className="pc-brand">{product.brand}</div>}
          <h3 className="pc-title">{product.title}</h3>

          {/* Rating */}
          {avgRating && (
            <div className="pc-rating">
              <StarFilled className="pc-star" />
              <span className="pc-rating-val">{avgRating}</span>
              <span className="pc-rating-count">({product.ratings.length})</span>
            </div>
          )}

          {/* Price */}
          <div className="pc-price-row">
            <span className="pc-price">${product.price?.toFixed(2)}</span>
            {product.oldPrice && (
              <span className="pc-old-price">${product.oldPrice.toFixed(2)}</span>
            )}
          </div>
        </div>
      </Link>

      {/* Add to Cart */}
      <button className="pc-atc" onClick={handleAddToCart} id={`atc-${product.slug}`}>
        Add to Cart
      </button>
    </div>
  );
};

export default ProductCard;
