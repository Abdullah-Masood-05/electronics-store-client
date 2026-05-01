"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Spin } from "antd";
import AuthGuard from "../components/AuthGuard";
import ProductCard from "../components/ProductCard";
import { getActiveDeals } from "../services/deal.service";
import { getCategories } from "../services/category.service";
import { getTrendingProducts, trackProductClick, searchProducts } from "../services/product.service";
import "../styles/home.css";

const categoryIcons = {
  laptops: "💻", phones: "📱", audio: "🎧",
  wearables: "⌚", gaming: "🎮", monitors: "🖥️", tablets: "📱",
  accessories: "🔌", cameras: "📷", default: "📦",
};
const getIcon = (name) => categoryIcons[name?.toLowerCase().replace(/\s+/g, "")] || categoryIcons.default;

function HomeContent() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [trending, setTrending] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getCategories().then((d) => setCategories(d.categories || [])).catch(() => {}),
      getTrendingProducts(8).then((d) => setTrending(d.products || [])).catch(() => {}),
      searchProducts({ sort: "newest", limit: 4 }).then((d) => setNewArrivals(d.products || [])).catch(() => {}),
      getActiveDeals().then((d) => setDeals(d.deals || [])).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="page-loader"><Spin size="large" /></div>;
  }

  return (
    <div className="home">
      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero-inner container">
          <div className="hero-content">
            <span className="badge badge-accent hero-badge">Limited Time Offer</span>
            <h1 className="hero-heading">Summer Tech Sale<br />Up to <span className="hero-accent">35% Off</span></h1>
            <p className="hero-sub">
              Premium electronics from top brands. Free shipping on orders over $99.
            </p>
            <div className="hero-actions">
              <Link href="/products" className="btn btn-primary btn-lg">Shop Now</Link>
              <Link href="/deals" className="btn btn-outline btn-lg">Browse Deals</Link>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-glow" />
            <div className="hero-device">🖥️</div>
          </div>
        </div>
      </section>

      {/* ── Categories ── */}
      {categories.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">Shop by Category</h2>
              <Link href="/products" className="section-link">View All →</Link>
            </div>
            <div className="cat-grid">
              {categories.slice(0, 6).map((cat) => (
                <Link key={cat._id} href={`/products?category=${cat.slug}`} className="cat-tile">
                  <span className="cat-icon">{getIcon(cat.name)}</span>
                  <span className="cat-name">{cat.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Trending ── */}
      {trending.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">Trending Now</h2>
              <Link href="/products?sort=popular" className="section-link">See All →</Link>
            </div>
            <div className="product-grid">
              {trending.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Deals ── */}
      {deals.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">Deals Ending Soon</h2>
              <Link href="/deals" className="section-link">All Deals →</Link>
            </div>
            <div className="deals-row">
              {deals.map((deal) => (
                <Link
                  key={deal._id}
                  href={deal.product?.slug ? `/products/${deal.product.slug}` : "/deals"}
                  className="deal-card"
                >
                  <div className="deal-card-left">
                    <span className="badge badge-red">Hot Deal</span>
                    <h3 className="deal-title">{deal.title}</h3>
                    <p className="deal-price">{deal.price}</p>
                    {deal.description && <p className="deal-desc">{deal.description}</p>}
                    <span className="deal-cta">Shop Now →</span>
                  </div>
                  <div className="deal-card-img">
                    {deal.image?.startsWith("http") ? (
                      <img src={deal.image} alt={deal.title} />
                    ) : (
                      <span className="deal-emoji">{deal.image || "🏷️"}</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── New Arrivals ── */}
      {newArrivals.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">New Arrivals</h2>
              <Link href="/products?sort=newest" className="section-link">See All →</Link>
            </div>
            <div className="product-grid product-grid--4">
              {newArrivals.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Trust Bar ── */}
      <section className="trust-bar">
        <div className="container">
          <div className="trust-grid">
            <div className="trust-item">
              <span className="trust-icon">🚚</span>
              <div>
                <div className="trust-label">Free Shipping</div>
                <div className="trust-sub">On orders over $99</div>
              </div>
            </div>
            <div className="trust-item">
              <span className="trust-icon">🔒</span>
              <div>
                <div className="trust-label">Secure Payment</div>
                <div className="trust-sub">256-bit SSL encryption</div>
              </div>
            </div>
            <div className="trust-item">
              <span className="trust-icon">↩️</span>
              <div>
                <div className="trust-label">Easy Returns</div>
                <div className="trust-sub">30-day return policy</div>
              </div>
            </div>
            <div className="trust-item">
              <span className="trust-icon">💬</span>
              <div>
                <div className="trust-label">24/7 Support</div>
                <div className="trust-sub">Chat or call anytime</div>
              </div>
            </div>
          </div>
        </div>
      </section>
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
