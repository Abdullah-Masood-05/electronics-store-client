"use client";

import { useState, useEffect } from "react";
import { Form, Input, Button, Typography, Card, Divider, App, Radio } from "antd";
import { MailOutlined, LockOutlined, UserOutlined, GoogleOutlined, CrownOutlined, ShoppingOutlined } from "@ant-design/icons";
import Link from "next/link";
import { useRouter } from "next/navigation";
import useAuth from "../../hooks/useAuth";
import "../../styles/auth.css";

const { Title, Text } = Typography;

export default function RegisterPage() {
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { register, loginWithGoogle, isAuthenticated, loading } = useAuth();
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
      await register(values.email, values.password, values.name, values.role);
      message.success("Account created successfully!");
      message.info("Verification email sent — please check your inbox.");
      router.replace("/");
    } catch (err) {
      const errorMsg =
        err.code === "auth/email-already-in-use"
          ? "An account with this email already exists"
          : err.code === "auth/weak-password"
          ? "Password is too weak. Use at least 6 characters"
          : err.message || "Registration failed";
      message.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      message.success("Account created successfully!");
      router.replace("/");
    } catch (err) {
      if (err.code !== "auth/popup-closed-by-user") {
        message.error(err.message || "Google sign-up failed");
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
              Create Account
            </Title>
            <Text className="auth-subtitle">
              Join ElectroStore today
            </Text>
          </div>

          {/* Google Sign-Up */}
          <Button
            block
            size="large"
            icon={<GoogleOutlined />}
            onClick={handleGoogleSignUp}
            loading={googleLoading}
            disabled={googleLoading || submitting}
            className="auth-google-btn"
            id="google-signup-btn"
          >
            Sign up with Google
          </Button>

          <Divider plain className="auth-divider-or">
            <Text type="secondary">or sign up with email</Text>
          </Divider>

          <Form
            name="register"
            layout="vertical"
            onFinish={onFinish}
            autoComplete="off"
            size="large"
            requiredMark={false}
            initialValues={{ role: "user" }}
          >
            <Form.Item
              name="name"
              rules={[
                { required: true, message: "Please enter your name" },
                { min: 2, message: "Name must be at least 2 characters" },
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="Full name"
                id="register-name"
              />
            </Form.Item>

            <Form.Item
              name="role"
              label={<Text style={{ color: "var(--text-secondary)" }}>I am signing up as</Text>}
              rules={[{ required: true, message: "Please select a role" }]}
            >
              <Radio.Group
                id="register-role"
                className="auth-role-selector"
                optionType="button"
                buttonStyle="solid"
                size="large"
                block
              >
                <Radio.Button value="user">
                  <ShoppingOutlined /> Customer
                </Radio.Button>
                <Radio.Button value="admin">
                  <CrownOutlined /> Admin
                </Radio.Button>
              </Radio.Group>
            </Form.Item>

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
                id="register-email"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: "Please enter a password" },
                { min: 6, message: "Password must be at least 6 characters" },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Password"
                id="register-password"
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              dependencies={["password"]}
              rules={[
                { required: true, message: "Please confirm your password" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error("Passwords do not match")
                    );
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Confirm password"
                id="register-confirm-password"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={submitting}
                disabled={submitting || googleLoading}
                className="auth-submit-btn"
                id="register-submit"
              >
                {submitting ? "Creating account..." : "Create Account"}
              </Button>
            </Form.Item>
          </Form>

          <Divider plain>
            <Text type="secondary">Already have an account?</Text>
          </Divider>

          <div style={{ textAlign: "center" }}>
            <Link href="/login">
              <Button type="link" className="auth-switch-btn">
                Sign in instead
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
