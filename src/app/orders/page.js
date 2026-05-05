"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getUserOrders } from "../../services/order.service";
import AuthGuard from "../../components/AuthGuard";
import "../../styles/orders.css";

const STATUS_CONFIG = {
  "Not Processed": { color: "#888", bg: "rgba(136,136,136,0.12)", label: "Pending" },
  Processing:      { color: "#2997FF", bg: "rgba(41,151,255,0.12)", label: "Processing" },
  Dispatched:      { color: "#845EF7", bg: "rgba(132,94,247,0.12)", label: "Dispatched" },
  Cancelled:       { color: "#FF6B6B", bg: "rgba(255,107,107,0.12)", label: "Cancelled" },
  Completed:       { color: "#51CF66", bg: "rgba(81,207,102,0.12)", label: "Completed" },
};

const PAYMENT_ICONS = { stripe: "💳", cod: "💵" };

function OrdersContent() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserOrders()
      .then((data) => setOrders(data.orders || []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="orders-loading">
        {[1, 2, 3].map((n) => (
          <div key={n} className="order-skeleton" />
        ))}
      </div>
    );
  }

  return (
    <div className="orders-page">
      <div className="orders-header">
        <h1 className="orders-title">My Orders</h1>
        <span className="orders-count">{orders.length} order{orders.length !== 1 ? "s" : ""}</span>
      </div>

      {orders.length === 0 ? (
        <div className="orders-empty">
          <div className="orders-empty-icon">📦</div>
          <h2>No orders yet</h2>
          <p>Your purchase history will appear here</p>
          <Link href="/products">
            <button className="btn-primary">Shop Now</button>
          </Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => {
            const cfg = STATUS_CONFIG[order.orderStatus] || STATUS_CONFIG["Not Processed"];
            const firstImage = order.products[0]?.product?.images?.[0]?.url
              || order.products[0]?.product?.images?.[0]
              || null;

            return (
              <div
                key={order._id}
                className="order-card"
                style={{ "--status-color": cfg.color }}
                onClick={() => router.push(`/orders/${order._id}`)}
              >
                {/* Status accent bar */}
                <div className="order-card-accent" style={{ background: cfg.color }} />

                <div className="order-card-body">
                  {/* Top row */}
                  <div className="order-card-top">
                    <div className="order-card-meta">
                      <span className="order-number">
                        #{order._id.slice(-8).toUpperCase()}
                      </span>
                      <span className="order-date">
                        {new Date(order.createdAt).toLocaleDateString("en-US", {
                          month: "short", day: "numeric", year: "numeric",
                        })}
                      </span>
                    </div>
                    <div
                      className="order-status-badge"
                      style={{ color: cfg.color, background: cfg.bg }}
                    >
                      {cfg.label}
                    </div>
                  </div>

                  {/* Products */}
                  <div className="order-items">
                    {/* Thumbnail strip */}
                    <div className="order-thumbs">
                      {order.products.slice(0, 4).map((item, i) => {
                        const img = item.product?.images?.[0]?.url
                          || item.product?.images?.[0]
                          || null;
                        return (
                          <div key={i} className="order-thumb">
                            {img
                              ? <img src={img} alt={item.product?.title} />
                              : <span className="order-thumb-placeholder">📦</span>
                            }
                          </div>
                        );
                      })}
                      {order.products.length > 4 && (
                        <div className="order-thumb order-thumb-more">
                          +{order.products.length - 4}
                        </div>
                      )}
                    </div>

                    {/* Item names */}
                    <div className="order-item-names">
                      {order.products.slice(0, 2).map((item, i) => (
                        <span key={i} className="order-item-name">
                          {item.product?.title || "Product"} ×{item.count}
                        </span>
                      ))}
                      {order.products.length > 2 && (
                        <span className="order-item-more">
                          +{order.products.length - 2} more item{order.products.length - 2 > 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Bottom row */}
                  <div className="order-card-bottom">
                    <span className="order-payment">
                      {PAYMENT_ICONS[order.paymentMethod]} {order.paymentMethod === "stripe" ? "Card" : "COD"}
                    </span>
                    <div className="order-card-right">
                      <span className="order-total">${order.totalAmount?.toFixed(2)}</span>
                      <span className="order-view-btn">View Details →</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function OrdersPage() {
  return (
    <AuthGuard>
      <OrdersContent />
    </AuthGuard>
  );
}
