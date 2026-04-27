"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Typography, Input, Radio, Button, message, Spin, Card } from "antd";
import { CreditCardOutlined, DollarOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import AuthGuard from "../../components/AuthGuard";
import useCart from "../../context/CartContext";
import { createCodOrder, createStripeIntent, confirmStripeOrder } from "../../services/order.service";
import "../../styles/checkout.css";

const { Title, Text } = Typography;

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY || "");

const cardStyle = {
  style: {
    base: {
      color: "#e5e7eb",
      fontFamily: "'Inter', sans-serif",
      fontSize: "14px",
      "::placeholder": { color: "#6b7280" },
    },
    invalid: { color: "#ef4444" },
  },
};

/** Stripe checkout form (mounted inside <Elements>) */
function StripeForm({ address, couponId, cartTotal, discount, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);

    try {
      // 1. Create intent
      const { clientSecret } = await createStripeIntent({
        couponId: couponId || undefined,
      });

      // 2. Confirm card payment
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: elements.getElement(CardElement) },
      });

      if (error) {
        message.error(error.message);
        setLoading(false);
        return;
      }

      // 3. Create order
      await confirmStripeOrder({
        paymentIntentId: paymentIntent.id,
        address,
        couponId: couponId || undefined,
      });

      onSuccess();
    } catch (err) {
      message.error(err.response?.data?.message || "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="stripe-card-wrapper">
        <CardElement options={cardStyle} />
      </div>
      <Button
        type="primary"
        htmlType="submit"
        loading={loading}
        disabled={!stripe}
        block
        size="large"
        className="checkout-pay-btn"
        id="pay-stripe"
      >
        Pay ${(cartTotal - discount).toFixed(2)}
      </Button>
    </form>
  );
}

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { cartItems, cartTotal, clearCart } = useCart();

  const couponId = searchParams.get("couponId") || "";
  const discountPct = Number(searchParams.get("discount")) || 0;
  const discount = (cartTotal * discountPct) / 100;
  const finalTotal = cartTotal - discount;

  const [paymentMethod, setPaymentMethod] = useState("stripe");
  const [address, setAddress] = useState({ street: "", city: "", state: "", zip: "" });
  const [codLoading, setCodLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const isAddressComplete = address.street && address.city && address.state && address.zip;

  const handleSuccess = () => {
    clearCart();
    setSuccess(true);
    message.success("Order placed successfully!");
  };

  const handleCodOrder = async () => {
    if (!isAddressComplete) {
      message.error("Please fill in your complete address");
      return;
    }
    setCodLoading(true);
    try {
      await createCodOrder({
        address,
        couponId: couponId || undefined,
      });
      handleSuccess();
    } catch (err) {
      message.error(err.response?.data?.message || "Order failed");
    } finally {
      setCodLoading(false);
    }
  };

  if (success) {
    return (
      <div className="checkout-success">
        <CheckCircleOutlined className="checkout-success-icon" />
        <Title level={2} className="checkout-success-title">Order Confirmed!</Title>
        <Text className="checkout-success-text">
          Thank you for your purchase. You can track your order in the Orders page.
        </Text>
        <div className="checkout-success-actions">
          <Button onClick={() => router.push("/orders")} type="primary" size="large">
            View Orders
          </Button>
          <Button onClick={() => router.push("/products")} size="large">
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0 && !success) {
    return (
      <div className="checkout-empty">
        <Text>Your cart is empty.</Text>
        <Button onClick={() => router.push("/products")} type="primary">
          Shop Now
        </Button>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <Title level={2} className="checkout-title">Checkout</Title>

      <div className="checkout-layout">
        {/* Left: Form */}
        <div className="checkout-form-area">
          {/* Address */}
          <Card className="checkout-card" title="Shipping Address" variant="borderless">
            <div className="checkout-address-grid">
              <div className="checkout-field">
                <label>Street</label>
                <Input
                  value={address.street}
                  onChange={(e) => setAddress({ ...address, street: e.target.value })}
                  placeholder="123 Main Street"
                  id="addr-street"
                />
              </div>
              <div className="checkout-field">
                <label>City</label>
                <Input
                  value={address.city}
                  onChange={(e) => setAddress({ ...address, city: e.target.value })}
                  placeholder="New York"
                  id="addr-city"
                />
              </div>
              <div className="checkout-field">
                <label>State</label>
                <Input
                  value={address.state}
                  onChange={(e) => setAddress({ ...address, state: e.target.value })}
                  placeholder="NY"
                  id="addr-state"
                />
              </div>
              <div className="checkout-field">
                <label>ZIP Code</label>
                <Input
                  value={address.zip}
                  onChange={(e) => setAddress({ ...address, zip: e.target.value })}
                  placeholder="10001"
                  id="addr-zip"
                />
              </div>
            </div>
          </Card>

          {/* Payment Method */}
          <Card className="checkout-card" title="Payment Method" variant="borderless">
            <Radio.Group
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="checkout-payment-options"
            >
              <Radio.Button value="stripe" className="checkout-payment-option" id="payment-stripe">
                <CreditCardOutlined /> Credit Card
              </Radio.Button>
              <Radio.Button value="cod" className="checkout-payment-option" id="payment-cod">
                <DollarOutlined /> Cash on Delivery
              </Radio.Button>
            </Radio.Group>

            {paymentMethod === "stripe" ? (
              <div className="checkout-stripe-area">
                <Elements stripe={stripePromise}>
                  <StripeForm
                    address={address}
                    couponId={couponId}
                    cartTotal={cartTotal}
                    discount={discount}
                    onSuccess={handleSuccess}
                  />
                </Elements>
              </div>
            ) : (
              <div className="checkout-cod-area">
                <Text className="checkout-cod-note">
                  You will pay ${finalTotal.toFixed(2)} when the order is delivered.
                </Text>
                <Button
                  type="primary"
                  size="large"
                  block
                  loading={codLoading}
                  onClick={handleCodOrder}
                  disabled={!isAddressComplete}
                  className="checkout-pay-btn"
                  id="pay-cod"
                >
                  Place Order — ${finalTotal.toFixed(2)}
                </Button>
              </div>
            )}
          </Card>
        </div>

        {/* Right: Order Summary */}
        <div className="checkout-summary">
          <Card className="checkout-card" title="Order Summary" variant="borderless">
            {cartItems.map((item) => (
              <div key={item.product._id || item.product} className="checkout-item-row">
                <span className="checkout-item-name">
                  {item.product.title} × {item.count}
                </span>
                <span>${((item.price || item.product.price) * item.count).toFixed(2)}</span>
              </div>
            ))}
            <div className="checkout-divider" />
            <div className="checkout-item-row">
              <span>Subtotal</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="checkout-item-row checkout-dis">
                <span>Discount ({discountPct}%)</span>
                <span>-${discount.toFixed(2)}</span>
              </div>
            )}
            <div className="checkout-divider" />
            <div className="checkout-item-row checkout-total-row">
              <span>Total</span>
              <span>${finalTotal.toFixed(2)}</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <AuthGuard>
      <Suspense fallback={<div className="checkout-loading"><Spin size="large" /></div>}>
        <CheckoutContent />
      </Suspense>
    </AuthGuard>
  );
}
