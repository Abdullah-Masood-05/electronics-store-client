"use client";

import { useState } from "react";
import { Form, Input, Button, Typography, message, Card, Divider } from "antd";
import { MailOutlined, LockOutlined, UserOutlined } from "@ant-design/icons";
import Link from "next/link";
import { useRouter } from "next/navigation";
import useAuth from "../../hooks/useAuth";

const { Title, Text } = Typography;

export default function RegisterPage() {
  const [submitting, setSubmitting] = useState(false);
  const { register, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  // If already authenticated, redirect to home
  if (!loading && isAuthenticated) {
    router.replace("/");
    return null;
  }

  const onFinish = async (values) => {
    setSubmitting(true);
    try {
      await register(values.email, values.password, values.name);
      message.success("Account created successfully!");
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

  return (
    <div className="auth-page">
      <div className="auth-container">
        <Card className="auth-card" bordered={false}>
          <div className="auth-header">
            <div className="auth-logo">⚡</div>
            <Title level={2} className="auth-title">
              Create Account
            </Title>
            <Text className="auth-subtitle">
              Join ElectroStore today
            </Text>
          </div>

          <Form
            name="register"
            layout="vertical"
            onFinish={onFinish}
            autoComplete="off"
            size="large"
            requiredMark={false}
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
                disabled={submitting}
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
