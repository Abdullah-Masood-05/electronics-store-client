"use client";

import { useState, useEffect } from "react";
import { Form, Input, Button, Typography, Card, Divider, App } from "antd";
import { MailOutlined, LockOutlined, GoogleOutlined } from "@ant-design/icons";
import Link from "next/link";
import { useRouter } from "next/navigation";
import useAuth from "../../hooks/useAuth";
import "../../styles/auth.css";

const { Title, Text } = Typography;

export default function LoginPage() {
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { login, loginWithGoogle, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const { message } = App.useApp();

  // Redirect if already authenticated
  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.replace("/");
    }
  }, [loading, isAuthenticated, router]);

  if (!loading && isAuthenticated) {
    return null;
  }

  const onFinish = async (values) => {
    setSubmitting(true);
    try {
      await login(values.email, values.password);
      message.success("Welcome back!");
      router.replace("/");
    } catch (err) {
      const errorMsg =
        err.code === "auth/invalid-credential"
          ? "Invalid email or password"
          : err.code === "auth/user-not-found"
          ? "No account found with this email"
          : err.code === "auth/too-many-requests"
          ? "Too many attempts. Please try again later"
          : err.message || "Login failed";
      message.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      message.success("Welcome!");
      router.replace("/");
    } catch (err) {
      if (err.code !== "auth/popup-closed-by-user") {
        message.error(err.message || "Google sign-in failed");
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <Card className="auth-card" variant="borderless">
          <div className="auth-header">
            <div className="auth-logo">⚡</div>
            <Title level={2} className="auth-title">
              Welcome Back
            </Title>
            <Text className="auth-subtitle">
              Sign in to your ElectroStore account
            </Text>
          </div>

          {/* Google Sign-In */}
          <Button
            block
            size="large"
            icon={<GoogleOutlined />}
            onClick={handleGoogleLogin}
            loading={googleLoading}
            disabled={googleLoading || submitting}
            className="auth-google-btn"
            id="google-login-btn"
          >
            Sign in with Google
          </Button>

          <Divider plain className="auth-divider-or">
            <Text type="secondary">or sign in with email</Text>
          </Divider>

          <Form
            name="login"
            layout="vertical"
            onFinish={onFinish}
            autoComplete="off"
            size="large"
            requiredMark={false}
          >
            <Form.Item
              name="email"
              rules={[
                { required: true, message: "Please enter your email" },
                { type: "email", message: "Please enter a valid email" },
              ]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="Email address"
                id="login-email"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: "Please enter your password" },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Password"
                id="login-password"
              />
            </Form.Item>

            <div className="auth-forgot-link">
              <Link href="/forgot-password">
                <Button type="link" size="small" id="forgot-password-link">
                  Forgot password?
                </Button>
              </Link>
            </div>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={submitting}
                disabled={submitting || googleLoading}
                className="auth-submit-btn"
                id="login-submit"
              >
                {submitting ? "Signing in..." : "Sign In"}
              </Button>
            </Form.Item>
          </Form>

          <Divider plain>
            <Text type="secondary">New to ElectroStore?</Text>
          </Divider>

          <div style={{ textAlign: "center" }}>
            <Link href="/register">
              <Button type="link" className="auth-switch-btn">
                Create an account
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
