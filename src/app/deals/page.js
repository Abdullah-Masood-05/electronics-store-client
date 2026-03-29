"use client";

import { Typography, Empty } from "antd";
import AuthGuard from "../../components/AuthGuard";

const { Title, Text } = Typography;

export default function DealsPage() {
  return (
    <AuthGuard>
      <div style={{ padding: "48px 24px", maxWidth: 1400, margin: "0 auto", textAlign: "center" }}>
        <Title level={2} style={{ color: "var(--text-primary)" }}>
          Deals & Offers
        </Title>
        <Empty
          description={
            <Text style={{ color: "var(--text-secondary)" }}>
              Hot deals coming soon! Stay tuned for amazing discounts.
            </Text>
          }
          style={{ marginTop: 48 }}
        />
      </div>
    </AuthGuard>
  );
}
