"use client";

import { useEffect, useState } from "react";
import { Spin, Tag } from "antd";
import { getAdminStats } from "../../../services/admin.service";
import { getAllOrders } from "../../../services/order.service";
import Link from "next/link";
import "../../../styles/admin-dashboard.css";

const STATUS_CONFIG = {
  "Not Processed": { color: "#888", label: "Pending" },
  Processing:      { color: "#2997FF", label: "Processing" },
  Dispatched:      { color: "#845EF7", label: "Dispatched" },
  Cancelled:       { color: "#FF6B6B", label: "Cancelled" },
  Completed:       { color: "#51CF66", label: "Completed" },
};

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAdminStats(), getAllOrders()])
      .then(([statsData, ordersData]) => {
        setStats(statsData.stats);
        setRecentOrders((ordersData.orders || []).slice(0, 5));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="ad-loading">
        <Spin size="large" />
      </div>
    );
  }

  const statCards = [
    {
      label: "Total Products",
      value: stats?.products ?? 0,
      icon: "📦",
      color: "var(--accent-primary, #2997ff)",
      href: "/admin/product",
    },
    {
      label: "Total Orders",
      value: stats?.totalOrders ?? 0,
      icon: "🛒",
      color: "#845ef7",
      href: "/admin/orders",
    },
    {
      label: "Revenue",
      value: `$${(stats?.totalRevenue ?? 0).toFixed(0)}`,
      icon: "💰",
      color: "#51cf66",
      isText: true,
    },
    {
      label: "Total Users",
      value: stats?.users ?? 0,
      icon: "👤",
      color: "#ffd43b",
    },
    {
      label: "Pending Orders",
      value: stats?.pendingOrders ?? 0,
      icon: "🕐",
      color: "#ff9f43",
      href: "/admin/orders",
    },
    {
      label: "Processing",
      value: stats?.processingOrders ?? 0,
      icon: "⚙️",
      color: "#2997ff",
      href: "/admin/orders",
    },
    {
      label: "Categories",
      value: stats?.categories ?? 0,
      icon: "🗂️",
      color: "#ff6b6b",
      href: "/admin/category",
    },
    {
      label: "Sub-categories",
      value: stats?.subcategories ?? 0,
      icon: "🏷️",
      color: "#ffa94d",
      href: "/admin/subcategory",
    },
  ];

  return (
    <div className="ad-page">
      <h2 className="ad-title">Dashboard Overview</h2>

      {/* Stats Grid */}
      <div className="ad-stats-grid">
        {statCards.map((c) => (
          <div key={c.label} className="ad-stat-card" style={{ "--card-color": c.color }}>
            {c.href ? (
              <Link href={c.href} className="ad-stat-link">
                <StatCardContent c={c} />
              </Link>
            ) : (
              <StatCardContent c={c} />
            )}
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      {recentOrders.length > 0 && (
        <div className="ad-recent">
          <div className="ad-recent-header">
            <h3 className="ad-recent-title">Recent Orders</h3>
            <Link href="/admin/orders" className="ad-recent-link">
              View All →
            </Link>
          </div>

          <div className="ad-orders-table">
            <div className="ad-table-head">
              <span>Order ID</span>
              <span>Customer</span>
              <span>Items</span>
              <span>Total</span>
              <span>Status</span>
              <span>Date</span>
            </div>
            {recentOrders.map((order) => {
              const cfg = STATUS_CONFIG[order.orderStatus] || STATUS_CONFIG["Not Processed"];
              return (
                <Link key={order._id} href={`/admin/orders`} className="ad-table-row">
                  <span className="ad-order-id">#{order._id.slice(-8).toUpperCase()}</span>
                  <span className="ad-customer">{order.orderedBy?.name || order.orderedBy?.email || "—"}</span>
                  <span className="ad-items">{order.products?.length ?? 0} item{order.products?.length !== 1 ? "s" : ""}</span>
                  <span className="ad-total">${order.totalAmount?.toFixed(2)}</span>
                  <span>
                    <span className="ad-status-dot" style={{ background: cfg.color }} />
                    <span style={{ color: cfg.color, fontSize: 12 }}>{cfg.label}</span>
                  </span>
                  <span className="ad-date">
                    {new Date(order.createdAt).toLocaleDateString("en-US", {
                      month: "short", day: "numeric",
                    })}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCardContent({ c }) {
  return (
    <>
      <div className="ad-stat-icon">{c.icon}</div>
      <div className="ad-stat-value" style={{ color: "var(--card-color)" }}>
        {c.isText ? c.value : c.value.toLocaleString()}
      </div>
      <div className="ad-stat-label">{c.label}</div>
    </>
  );
}
