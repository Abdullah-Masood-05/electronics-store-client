"use client";

import Link from "next/link";
import useAuth from "../hooks/useAuth";
import AuthGuard from "../components/AuthGuard";
import "../styles/home.css";

/* ── Hardcoded data (Phase 6 placeholder) ── */
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

  const memberSince = backendUser?.createdAt
    ? new Date(backendUser.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "N/A";

  const getInitial = (name) => name?.charAt(0)?.toUpperCase() || "U";

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
          <div className="stat-card-value">
            📦 {0}
          </div>
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

          {/* Featured Deal */}
          <div className="featured-deal">
            <div>
              <span className="featured-deal-badge">Featured Deal</span>
              <h3>MacBook Pro M3</h3>
              <p className="featured-deal-price">Starting at $1,299</p>
              <Link href="/products" className="featured-deal-btn">
                View Deal
              </Link>
            </div>
            <div className="featured-deal-image">
              <span style={{ fontSize: 64 }}>💻</span>
            </div>
          </div>

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
