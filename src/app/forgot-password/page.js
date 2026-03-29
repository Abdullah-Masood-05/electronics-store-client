"use client";

import { useState } from "react";
import { Form, Input, Button, Typography, Card, Result, App } from "antd";
import { MailOutlined } from "@ant-design/icons";
import Link from "next/link";
import useAuth from "../../hooks/useAuth";
import "../../styles/auth.css";

const { Title, Text } = Typography;

export default function ForgotPasswordPage() {
  const [submitting, setSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { forgotPassword } = useAuth();
  const { message } = App.useApp();

  const onFinish = async (values) => {
    setSubmitting(true);
    try {
      await forgotPassword(values.email);
      setEmailSent(true);
    } catch (err) {
      const errorMsg =
        err.code === "auth/user-not-found"
          ? "No account found with this email"
          : err.code === "auth/too-many-requests"
          ? "Too many attempts. Please try again later"
          : err.code === "auth/invalid-email"
          ? "Please enter a valid email address"
          : err.message || "Failed to send reset email";
      message.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <Card className="auth-card" variant="borderless">
          {emailSent ? (
            <Result
              status="success"
              title="Reset Email Sent"
              subTitle="Check your inbox for a password reset link. It may take a few minutes to arrive."
              extra={
                <Link href="/login">
                  <Button type="primary" className="auth-submit-btn" id="back-to-login-btn">
                    Back to Sign In
                  </Button>
                </Link>
              }
              style={{ padding: "16px 0" }}
            />
          ) : (
            <>
              <div className="auth-header">
                <div className="auth-logo">🔐</div>
                <Title level={2} className="auth-title">
                  Reset Password
                </Title>
                <Text className="auth-subtitle">
                  Enter your email and we&apos;ll send you a reset link
                </Text>
              </div>

              <Form
                name="forgot-password"
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
                    id="forgot-email"
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
                    id="forgot-submit"
                  >
                    {submitting ? "Sending..." : "Send Reset Link"}
                  </Button>
                </Form.Item>
              </Form>

              <div style={{ textAlign: "center" }}>
                <Link href="/login">
                  <Button type="link" className="auth-switch-btn">
                    Back to Sign In
                  </Button>
                </Link>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
