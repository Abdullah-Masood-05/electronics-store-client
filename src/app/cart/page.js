"use client";

import { useState } from "react";
import { InputNumber, Button, Input, Empty, Spin, App } from "antd";
import { DeleteOutlined, ArrowRightOutlined, TagOutlined, SafetyOutlined } from "@ant-design/icons";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthGuard from "../../components/AuthGuard";
import useCart from "../../context/CartContext";
import { applyCoupon } from "../../services/coupon.service";
import "../../styles/cart.css";

function CartContent() {
  const router = useRouter();
  const { message } = App.useApp();
  const { cartItems, cartTotal, updateQuantity, removeFromCart, loading } = useCart();
  const [couponCode, setCouponCode] = useState("");
  const [coupon, setCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const data = await applyCoupon(couponCode);
      setCoupon(data);
      message.success(`Coupon applied! ${data.discount}% off`);
    } catch (err) {
      message.error(err.response?.data?.message || "Invalid coupon");
      setCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const itemCount = cartItems.reduce((s, i) => s + i.count, 0);
  const discount = coupon ? (cartTotal * coupon.discount) / 100 : 0;
  const shipping = cartTotal >= 99 ? 0 : 9.99;
  const tax = (cartTotal - discount) * 0.08;
  const finalTotal = cartTotal - discount + shipping + tax;

  const handleCheckout = () => {
    const params = coupon ? `?couponId=${coupon.couponId}&discount=${coupon.discount}` : "";
    router.push(`/checkout${params}`);
  };

  if (loading) {
    return <div className="cart-loading"><Spin size="large" /></div>;
  }

  return (
    <div className="cart-page container">
      <h1 className="cart-heading">Shopping Cart</h1>

      {cartItems.length === 0 ? (
        <div className="cart-empty">
          <div className="cart-empty-icon">🛒</div>
          <h2 className="cart-empty-title">Your cart is empty</h2>
          <p className="cart-empty-sub">Looks like you haven't added anything to your cart yet.</p>
          <Link href="/products" className="btn btn-primary">Browse Products</Link>
        </div>
      ) : (
        <div className="cart-layout">
          {/* Items */}
          <div className="cart-items">
            {/* Column Headers */}
            <div className="cart-col-head">
              <span className="cart-col-product">Product</span>
              <span className="cart-col-qty">Quantity</span>
              <span className="cart-col-total">Total</span>
              <span className="cart-col-action" />
            </div>

            {cartItems.map((item) => {
              const product = item.product;
              const unitPrice = item.price || product.price || 0;
              return (
                <div key={product._id || product} className="cart-row">
                  <div className="cart-row-product">
                    <div className="cart-row-img">
                      {product.images?.[0]?.url ? (
                        <img src={product.images[0].url} alt={product.title} />
                      ) : (
                        <span className="cart-row-placeholder">📦</span>
                      )}
                    </div>
                    <div className="cart-row-info">
                      <Link href={`/products/${product.slug}`} className="cart-row-title">
                        {product.title}
                      </Link>
                      <span className="cart-row-price">${unitPrice.toFixed(2)}</span>
                      <span className="cart-row-delivery">📦 Est. delivery: 3–5 business days</span>
                    </div>
                  </div>
                  <div className="cart-row-qty">
                    <div className="qty-stepper">
                      <button className="qty-btn" onClick={() => updateQuantity(product._id, item.count - 1)} disabled={item.count <= 1}>−</button>
                      <span className="qty-val">{item.count}</span>
                      <button className="qty-btn" onClick={() => updateQuantity(product._id, item.count + 1)}>+</button>
                    </div>
                  </div>
                  <div className="cart-row-total">
                    ${(unitPrice * item.count).toFixed(2)}
                  </div>
                  <button className="cart-row-remove" onClick={() => removeFromCart(product._id)} title="Remove">
                    <DeleteOutlined />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div className="cart-summary">
            <div className="cart-summary-card">
              <h3 className="cart-summary-heading">Order Summary</h3>

              <div className="cart-summary-line">
                <span>Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>

              {coupon && (
                <div className="cart-summary-line cart-line-green">
                  <span>Discount ({coupon.code})</span>
                  <span>−${discount.toFixed(2)}</span>
                </div>
              )}

              <div className="cart-summary-line">
                <span>Shipping</span>
                <span>{shipping === 0 ? <span className="cart-line-green">Free</span> : `$${shipping.toFixed(2)}`}</span>
              </div>

              <div className="cart-summary-line">
                <span>Est. Tax</span>
                <span>${tax.toFixed(2)}</span>
              </div>

              <div className="cart-summary-sep" />

              <div className="cart-summary-line cart-summary-total-line">
                <span>Total</span>
                <span>${finalTotal.toFixed(2)}</span>
              </div>

              {cartTotal < 99 && (
                <div className="cart-shipping-note">
                  Add ${(99 - cartTotal).toFixed(2)} more for free shipping
                </div>
              )}

              {/* Coupon */}
              <div className="cart-coupon-row">
                <Input
                  placeholder="Coupon code"
                  prefix={<TagOutlined />}
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  onPressEnter={handleApplyCoupon}
                  size="small"
                  id="coupon-input"
                />
                <Button onClick={handleApplyCoupon} loading={couponLoading} size="small" id="apply-coupon">
                  Apply
                </Button>
              </div>

              <button className="cart-checkout-cta" onClick={handleCheckout} id="checkout-btn">
                Proceed to Checkout
                <ArrowRightOutlined />
              </button>

              {/* Trust */}
              <div className="cart-trust">
                <span>🔒 Secure Checkout</span>
                <span>↩️ 30-Day Returns</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CartPage() {
  return (
    <AuthGuard>
      <CartContent />
    </AuthGuard>
  );
}
