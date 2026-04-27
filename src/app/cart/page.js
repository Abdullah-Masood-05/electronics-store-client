"use client";

import { useState } from "react";
import { Typography, InputNumber, Button, Input, Empty, Spin, message } from "antd";
import { DeleteOutlined, ArrowRightOutlined, TagOutlined } from "@ant-design/icons";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthGuard from "../../components/AuthGuard";
import useCart from "../../context/CartContext";
import { applyCoupon } from "../../services/coupon.service";
import "../../styles/cart.css";

const { Title, Text } = Typography;

function CartContent() {
  const router = useRouter();
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

  const discount = coupon ? (cartTotal * coupon.discount) / 100 : 0;
  const finalTotal = cartTotal - discount;

  const handleCheckout = () => {
    // Pass coupon info via query params
    const params = coupon ? `?couponId=${coupon.couponId}&discount=${coupon.discount}` : "";
    router.push(`/checkout${params}`);
  };

  if (loading) {
    return (
      <div className="cart-loading">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="cart-page">
      <Title level={2} className="cart-title">Shopping Cart</Title>

      {cartItems.length === 0 ? (
        <div className="cart-empty">
          <Empty description={<Text className="cart-empty-text">Your cart is empty</Text>} />
          <Link href="/products">
            <Button type="primary" size="large" className="cart-shop-btn">
              Browse Products
            </Button>
          </Link>
        </div>
      ) : (
        <div className="cart-layout">
          {/* Cart Items */}
          <div className="cart-items">
            {cartItems.map((item) => {
              const product = item.product;
              return (
                <div key={product._id || product} className="cart-item">
                  <div className="cart-item-image">
                    {product.images?.[0]?.url ? (
                      <img src={product.images[0].url} alt={product.title} />
                    ) : (
                      <div className="cart-item-placeholder">📦</div>
                    )}
                  </div>
                  <div className="cart-item-info">
                    <Link href={`/products/${product.slug}`} className="cart-item-title">
                      {product.title}
                    </Link>
                    <Text className="cart-item-price">
                      ${(item.price || product.price)?.toFixed(2)}
                    </Text>
                  </div>
                  <div className="cart-item-qty">
                    <InputNumber
                      min={1}
                      max={product.quantity || 99}
                      value={item.count}
                      onChange={(val) => updateQuantity(product._id, val)}
                      size="small"
                    />
                  </div>
                  <div className="cart-item-subtotal">
                    <Text strong>
                      ${((item.price || product.price) * item.count).toFixed(2)}
                    </Text>
                  </div>
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => removeFromCart(product._id)}
                    className="cart-item-remove"
                  />
                </div>
              );
            })}
          </div>

          {/* Order Summary Sidebar */}
          <div className="cart-summary">
            <div className="cart-summary-card">
              <h3 className="cart-summary-title">Order Summary</h3>

              <div className="cart-summary-row">
                <span>Subtotal ({cartItems.reduce((s, i) => s + i.count, 0)} items)</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>

              {coupon && (
                <div className="cart-summary-row cart-summary-discount">
                  <span>Coupon ({coupon.code})</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}

              <div className="cart-summary-divider" />

              <div className="cart-summary-row cart-summary-total">
                <span>Total</span>
                <span>${finalTotal.toFixed(2)}</span>
              </div>

              {/* Coupon Input */}
              <div className="cart-coupon">
                <Input
                  placeholder="Coupon code"
                  prefix={<TagOutlined />}
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  onPressEnter={handleApplyCoupon}
                  id="coupon-input"
                />
                <Button
                  onClick={handleApplyCoupon}
                  loading={couponLoading}
                  id="apply-coupon"
                >
                  Apply
                </Button>
              </div>

              <Button
                type="primary"
                size="large"
                block
                onClick={handleCheckout}
                className="cart-checkout-btn"
                id="checkout-btn"
              >
                Proceed to Checkout <ArrowRightOutlined />
              </Button>
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
