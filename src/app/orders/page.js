"use client";

import { Typography, Empty } from "antd";
import AuthGuard from "../../components/AuthGuard";

const { Title, Text } = Typography;

export default function OrdersPage() {
  return (
    <AuthGuard>
      <div style={{ padding: "48px 24px", maxWidth: 1400, margin: "0 auto", textAlign: "center" }}>
        <Title level={2} style={{ color: "var(--text-primary)" }}>
          My Orders
        </Title>
        <Empty
          description={
            <Text style={{ color: "var(--text-secondary)" }}>
              You haven&apos;t placed any orders yet. Start shopping!
            </Text>
          }
          style={{ marginTop: 48 }}
        />
      </div>
    </AuthGuard>
  );
}
