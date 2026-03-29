"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import useAuth from "../hooks/useAuth";
import AuthGuard from "../components/AuthGuard";
import { getActiveDeals } from "../services/deal.service";
import "../styles/home.css";

/* ── Hardcoded placeholders ── */
const categories = [
  { name: "Laptops", icon: "💻", slug: "laptops" },
  { name: "Mobiles", icon: "📱", slug: "mobiles" },
  { name: "Audio", icon: "🎧", slug: "audio" },
  { name: "Wearables", icon: "⌚", slug: "wearables" },
];

const trendingProducts = [
  { category: "Mobile", icon: "📱", name: "iPhone 16 Pro", price: "$999", slug: "iphone-16-pro" },
  { category: "Audio", icon: "🎧", name: "Sony WH-1000XM5", price: "$329", slug: "sony-wh-1000xm5" },
  { category: "Wearable", icon: "⌚", name: "Apple Watch S9", price: "$399", slug: "apple-watch-s9" },
  { category: "Laptop", icon: "💻", name: "Dell XPS 15", price: "$1,499", slug: "dell-xps-15" },
  { category: "Monitor", icon: "🖥️", name: 'LG 27" 4K', price: "$699", slug: "lg-27-4k" },
  { category: "Gaming", icon: "🎮", name: "PS5 Controller", price: "$69", slug: "ps5-controller" },
];

function HomeContent() {
  const { backendUser, firebaseUser } = useAuth();
  const [deals, setDeals] = useState([]);

  useEffect(() => {
    getActiveDeals()
      .then((data) => setDeals(data.deals || []))
      .catch(() => setDeals([]));
  }, []);

  const memberSince = backendUser?.createdAt
    ? new Date(backendUser.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "N/A";

  const getInitial = (name) => name?.charAt(0)?.toUpperCase() || "U";

  /**
   * Resolve the link for a deal.
   * If a deal has a linked product, go to its detail page.
   * Otherwise, go to the deals page.
   */
  const getDealLink = (deal) => {
    if (deal.product?.slug) return `/products/${deal.product.slug}`;
    return "/deals";
  };

  /**
   * Render the deal image — either an emoji string or an <img> URL.
   */
  const renderDealImage = (deal) => {
    if (!deal.image) return <span style={{ fontSize: 64 }}>🏷️</span>;
    // If it starts with http, render as image
    if (deal.image.startsWith("http")) {
      return <img src={deal.image} alt={deal.title} />;
    }
    // Otherwise treat as emoji/text
    return <span style={{ fontSize: 64 }}>{deal.image}</span>;
  };

  return (
    <div className="home-page">
      {/* ── Hero Section ── */}
      <div className="home-hero">
        <div className="home-hero-left">
          <h1>
            Hey, <strong>{backendUser?.name || "User"}</strong> 👋
          </h1>
          <p className="home-hero-subtitle">
            Your personal electronics hub — browse deals, track orders, manage
            wishlist.
          </p>
        </div>
        <div className="home-hero-actions">
          <Link href="/orders">
            <button className="btn-outline">View Orders</button>
          </Link>
          <Link href="/products">
            <button className="btn-primary">Shop Now</button>
          </Link>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="home-stats">
        <div className="stat-card stat-card--accent">
          <div className="stat-card-label">Cart Items</div>
          <div className="stat-card-value">
            🛒 {backendUser?.cart?.length || 0}
          </div>
          <div className="stat-card-hint">
            {backendUser?.cart?.length
              ? `${backendUser.cart.length} item(s) in cart`
              : "Nothing yet — start shopping!"}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-label">Wishlist</div>
          <div className="stat-card-value">
            🤍 {backendUser?.wishlist?.length || 0}
          </div>
          <div className="stat-card-hint">Save items for later</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-label">Orders Placed</div>
          <div className="stat-card-value">📦 {0}</div>
          <div className="stat-card-hint">No orders yet</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-label">Account</div>
          <div className="stat-card-value">
            <span className="success">✓ Active</span>
          </div>
          <div className="stat-card-hint">
            <span className="accent">Verified member</span>
          </div>
        </div>
      </div>

      {/* ── Two-Column Layout ── */}
      <div className="home-main">
        {/* Left Column */}
        <div>
          {/* Shop by Category */}
          <div className="section-header">
            <h2 className="section-title">Shop by Category</h2>
            <Link href="/products" className="section-link">
              All categories →
            </Link>
          </div>
          <div className="category-grid">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/products/category/${cat.slug}`}
                className="category-card"
              >
                <span className="category-card-icon">{cat.icon}</span>
                <span className="category-card-name">{cat.name}</span>
              </Link>
            ))}
          </div>

          {/* Featured Deals — dynamic from backend */}
          {deals.length > 0 && (
            <>
              <div className="section-header">
                <h2 className="section-title">Featured Deals</h2>
                <Link href="/deals" className="section-link">
                  All deals →
                </Link>
              </div>
              <div className="deals-list">
                {deals.map((deal) => (
                  <Link
                    key={deal._id}
                    href={getDealLink(deal)}
                    className="featured-deal"
                  >
                    <div>
                      <span className="featured-deal-badge">Featured Deal</span>
                      <h3>{deal.title}</h3>
                      <p className="featured-deal-price">{deal.price}</p>
                      {deal.description && (
                        <p className="featured-deal-desc">{deal.description}</p>
                      )}
                      <span className="featured-deal-btn">View Deal</span>
                    </div>
                    <div className="featured-deal-image">
                      {renderDealImage(deal)}
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}

          {/* Trending Products */}
          <div className="section-header">
            <h2 className="section-title">Trending Products</h2>
            <Link href="/products" className="section-link">
              See all →
            </Link>
          </div>
          <div className="trending-grid">
            {trendingProducts.map((p) => (
              <Link
                key={p.slug}
                href={`/products/${p.slug}`}
                className="trending-card"
              >
                <span className="trending-card-icon">{p.icon}</span>
                <div className="trending-card-category">{p.category}</div>
                <div className="trending-card-name">{p.name}</div>
                <div className="trending-card-price">{p.price}</div>
              </Link>
            ))}
          </div>
        </div>

        {/* Right Sidebar */}
        <div>
          {/* Profile Card */}
          <div className="profile-sidebar-card">
            <div className="profile-sidebar-top">
              <div className="profile-sidebar-avatar">
                {getInitial(backendUser?.name)}
              </div>
              <div>
                <div className="profile-sidebar-name">
                  {backendUser?.name || "User"}
                </div>
                <div className="profile-sidebar-email">
                  {backendUser?.email}
                </div>
                <span className="profile-sidebar-badge active">● Active</span>
              </div>
            </div>

            <div className="profile-sidebar-details">
              <div className="profile-detail-row">
                <span className="detail-icon">📅</span>
                <div>
                  <div className="profile-detail-label">Member since</div>
                  <div className="profile-detail-value">{memberSince}</div>
                </div>
              </div>
              <div className="profile-detail-row">
                <span className="detail-icon">🆔</span>
                <div>
                  <div className="profile-detail-label">Firebase UID</div>
                  <div className="profile-detail-value">
                    {firebaseUser?.uid?.slice(0, 12)}...
                  </div>
                </div>
              </div>
              <div className="profile-detail-row">
                <span className="detail-icon">👤</span>
                <div>
                  <div className="profile-detail-label">Role</div>
                  <div className="profile-detail-value">
                    {backendUser?.role
                      ? backendUser.role.charAt(0).toUpperCase() +
                        backendUser.role.slice(1)
                      : "User"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Wishlist Card */}
          <div className="wishlist-sidebar-card">
            <div className="wishlist-sidebar-header">
              <h3 className="wishlist-sidebar-title">Wishlist</h3>
              <Link href="/wishlist" className="section-link">
                Manage →
              </Link>
            </div>
            <div className="wishlist-empty">
              <div className="wishlist-empty-icon">💜</div>
              <p>No saved items yet</p>
              <span>Tap the heart on any product</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <AuthGuard>
      <HomeContent />
    </AuthGuard>
  );
}
