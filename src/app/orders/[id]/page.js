"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getOrderById } from "../../../services/order.service";
import AuthGuard from "../../../components/AuthGuard";
import "../../../styles/order-detail.css";

const STATUS_STEPS = ["Not Processed", "Processing", "Dispatched", "Completed"];

const STATUS_ICONS = {
  "Not Processed": "🕐",
  Processing: "⚙️",
  Dispatched: "🚚",
  Completed: "✅",
  Cancelled: "❌",
};

const PAYMENT_LABELS = { stripe: "Credit / Debit Card", cod: "Cash on Delivery" };

function OrderDetailContent() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getOrderById(id)
      .then((data) => setOrder(data.order))
      .catch(() => setError("Order not found or access denied."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="od-loading">
        <div className="od-spinner" />
        <p>Loading order details…</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="od-error">
        <p>{error || "Something went wrong."}</p>
        <button className="od-back-btn" onClick={() => router.push("/orders")}>
          ← Back to Orders
        </button>
      </div>
    );
  }

  const isCancelled = order.orderStatus === "Cancelled";
  const currentStep = isCancelled ? -1 : STATUS_STEPS.indexOf(order.orderStatus);

  return (
    <div className="od-page">
      {/* Header */}
      <div className="od-header">
        <button className="od-back-btn" onClick={() => router.push("/orders")}>
          ← My Orders
        </button>
        <div className="od-header-right">
          <span className="od-id">Order #{order._id.slice(-8).toUpperCase()}</span>
          <span className="od-date">
            {new Date(order.createdAt).toLocaleDateString("en-US", {
              weekday: "short", year: "numeric", month: "long", day: "numeric",
            })}
          </span>
        </div>
      </div>

      {/* Status Timeline */}
      <div className="od-timeline-card">
        <h3 className="od-section-title">Order Status</h3>
        {isCancelled ? (
          <div className="od-cancelled-badge">❌ Order Cancelled</div>
        ) : (
          <div className="od-timeline">
            {STATUS_STEPS.map((step, i) => (
              <div
                key={step}
                className={`od-step ${i < currentStep ? "completed" : ""} ${i === currentStep ? "active" : ""}`}
              >
                <div className="od-step-icon">
                  {i <= currentStep ? STATUS_ICONS[step] : <span className="od-step-dot" />}
                </div>
                <div className="od-step-label">{step}</div>
                {i < STATUS_STEPS.length - 1 && (
                  <div className={`od-step-line ${i < currentStep ? "filled" : ""}`} />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="od-grid">
        {/* Products */}
        <div className="od-products-card">
          <h3 className="od-section-title">Items Ordered</h3>
          <div className="od-product-list">
            {order.products.map((item, i) => {
              const p = item.product;
              const img = p?.images?.[0]?.url || p?.images?.[0] || "/placeholder.png";
              return (
                <div key={i} className="od-product-row">
                  <Link href={`/products/${p?.slug || "#"}`}>
                    <img src={img} alt={p?.title} className="od-product-img" />
                  </Link>
                  <div className="od-product-info">
                    <Link href={`/products/${p?.slug || "#"}`} className="od-product-name">
                      {p?.title || "Product"}
                    </Link>
                    {p?.brand && <span className="od-product-brand">{p.brand}</span>}
                    <span className="od-product-qty">Qty: {item.count}</span>
                  </div>
                  <div className="od-product-price">
                    ${(item.price * item.count).toFixed(2)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Summary Sidebar */}
        <div className="od-sidebar">
          {/* Price Summary */}
          <div className="od-summary-card">
            <h3 className="od-section-title">Order Summary</h3>
            <div className="od-summary-row">
              <span>Subtotal</span>
              <span>${order.totalAmount?.toFixed(2)}</span>
            </div>
            {order.coupon && (
              <div className="od-summary-row od-discount">
                <span>Coupon ({order.coupon.code})</span>
                <span>−{order.coupon.discount}%</span>
              </div>
            )}
            <div className="od-summary-row od-shipping">
              <span>Shipping</span>
              <span className="od-free">Free</span>
            </div>
            <div className="od-summary-divider" />
            <div className="od-summary-row od-total">
              <span>Total</span>
              <span>${order.totalAmount?.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment & Delivery */}
          <div className="od-info-card">
            <h3 className="od-section-title">Payment</h3>
            <div className="od-info-row">
              <span className="od-info-label">Method</span>
              <span className="od-info-value">
                {PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod}
              </span>
            </div>
            {order.paymentIntent?.id && (
              <div className="od-info-row">
                <span className="od-info-label">Transaction ID</span>
                <span className="od-info-value od-mono">
                  {order.paymentIntent.id.slice(-12)}
                </span>
              </div>
            )}
          </div>

          <div className="od-info-card">
            <h3 className="od-section-title">Delivery Address</h3>
            <address className="od-address">
              <p>{order.address?.street}</p>
              <p>{order.address?.city}, {order.address?.state} {order.address?.zip}</p>
            </address>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrderDetailPage() {
  return (
    <AuthGuard>
      <OrderDetailContent />
    </AuthGuard>
  );
}
