"use client";

import { useState } from "react";
import { Form, Input, Button, Typography, message, Card, Divider } from "antd";
import { MailOutlined, LockOutlined } from "@ant-design/icons";
import Link from "next/link";
import { useRouter } from "next/navigation";
import useAuth from "../../hooks/useAuth";

const { Title, Text } = Typography;

export default function LoginPage() {
  const [submitting, setSubmitting] = useState(false);
  const { login, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  // If already authenticated, redirect to home
  if (!loading && isAuthenticated) {
    router.replace("/");
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

  return (
    <div className="auth-page">
      <div className="auth-container">
        <Card className="auth-card" bordered={false}>
          <div className="auth-header">
            <div className="auth-logo">⚡</div>
            <Title level={2} className="auth-title">
              Welcome Back
            </Title>
            <Text className="auth-subtitle">
              Sign in to your ElectroStore account
            </Text>
          </div>

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

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={submitting}
                disabled={submitting}
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
