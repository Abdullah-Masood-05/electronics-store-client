"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Spin } from "antd";
import useAuth from "../hooks/useAuth";
import AuthGuard from "../components/AuthGuard";
import { getActiveDeals } from "../services/deal.service";
import { getCategories } from "../services/category.service";
import { getTrendingProducts, trackProductClick } from "../services/product.service";
import "../styles/home.css";

/* Category icon mapping — emoji fallbacks by name */
const categoryIcons = {
  laptops: "💻",
  mobiles: "📱",
  phones: "📱",
  audio: "🎧",
  wearables: "⌚",
  gaming: "🎮",
  monitors: "🖥️",
  tablets: "📱",
  accessories: "🔌",
  cameras: "📷",
  default: "📦",
};

const getIconForCategory = (name) => {
  const key = name?.toLowerCase().replace(/\s+/g, "");
  return categoryIcons[key] || categoryIcons.default;
};

function HomeContent() {
  const { backendUser, firebaseUser } = useAuth();
  const router = useRouter();
  const [deals, setDeals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingTrending, setLoadingTrending] = useState(true);

  useEffect(() => {
    // Fetch deals
    getActiveDeals()
      .then((data) => setDeals(data.deals || []))
      .catch(() => setDeals([]));

    // Fetch categories
    getCategories()
      .then((data) => setCategories(data.categories || []))
      .catch(() => setCategories([]))
      .finally(() => setLoadingCategories(false));

    // Fetch trending products (top 6 by clickCount)
    getTrendingProducts(6)
      .then((data) => setTrendingProducts(data.products || []))
      .catch(() => setTrendingProducts([]))
      .finally(() => setLoadingTrending(false));
  }, []);

  const memberSince = backendUser?.createdAt
    ? new Date(backendUser.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "N/A";

  const getInitial = (name) => name?.charAt(0)?.toUpperCase() || "U";

  const getDealLink = (deal) => {
    if (deal.product?.slug) return `/products/${deal.product.slug}`;
    return "/deals";
  };

  const renderDealImage = (deal) => {
    if (!deal.image) return <span style={{ fontSize: 64 }}>🏷️</span>;
    if (deal.image.startsWith("http")) {
      return <img src={deal.image} alt={deal.title} />;
    }
    return <span style={{ fontSize: 64 }}>{deal.image}</span>;
  };

  /**
   * When a user clicks on a trending product:
   * 1. Fire the click-tracker (fire-and-forget)
   * 2. Navigate to the product detail page
   */
  const handleProductClick = (product) => {
    trackProductClick(product.slug);
    router.push(`/products/${product.slug}`);
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
          {/* Shop by Category — dynamic from database */}
          <div className="section-header">
            <h2 className="section-title">Shop by Category</h2>
            <Link href="/products" className="section-link">
              All categories →
            </Link>
          </div>
          {loadingCategories ? (
            <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
              <Spin />
            </div>
          ) : categories.length === 0 ? (
            <p style={{ color: "var(--text-muted)", marginBottom: 24 }}>
              No categories yet
            </p>
          ) : (
            <div className="category-grid">
              {categories.map((cat) => (
                <Link
                  key={cat._id}
                  href={`/products/category/${cat.slug}`}
                  className="category-card"
                >
                  <span className="category-card-icon">
                    {getIconForCategory(cat.name)}
                  </span>
                  <span className="category-card-name">{cat.name}</span>
                </Link>
              ))}
            </div>
          )}

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

          {/* Trending Products — dynamic, sorted by clickCount */}
          <div className="section-header">
            <h2 className="section-title">Trending Products</h2>
            <Link href="/products" className="section-link">
              See all →
            </Link>
          </div>
          {loadingTrending ? (
            <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
              <Spin />
            </div>
          ) : trendingProducts.length === 0 ? (
            <p style={{ color: "var(--text-muted)", marginBottom: 24 }}>
              No products yet — add some in the admin panel
            </p>
          ) : (
            <div className="trending-grid">
              {trendingProducts.map((p) => (
                <div
                  key={p._id}
                  className="trending-card"
                  onClick={() => handleProductClick(p)}
                >
                  {p.images?.[0]?.url ? (
                    <img
                      src={p.images[0].url}
                      alt={p.title}
                      className="trending-card-thumb"
                    />
                  ) : (
                    <span className="trending-card-icon">
                      {getIconForCategory(p.category?.name)}
                    </span>
                  )}
                  <div className="trending-card-category">
                    {p.category?.name || "Uncategorized"}
                  </div>
                  <div className="trending-card-name">{p.title}</div>
                  <div className="trending-card-price">
                    ${p.price?.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          )}
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
