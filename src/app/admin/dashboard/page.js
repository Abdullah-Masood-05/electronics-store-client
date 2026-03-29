"use client";

import { useEffect, useState } from "react";
import { Card, Row, Col, Statistic, Spin, Typography } from "antd";
import {
  ShoppingOutlined,
  AppstoreOutlined,
  TagsOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { getAdminStats } from "../../../services/admin.service";

const { Title } = Typography;

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminStats()
      .then((data) => setStats(data.stats))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 80 }}>
        <Spin size="large" />
      </div>
    );
  }

  const cards = [
    { title: "Total Products", value: stats?.products || 0, icon: <ShoppingOutlined />, color: "var(--accent-primary)" },
    { title: "Categories", value: stats?.categories || 0, icon: <AppstoreOutlined />, color: "#ff6b6b" },
    { title: "Sub-categories", value: stats?.subcategories || 0, icon: <TagsOutlined />, color: "#ffd43b" },
    { title: "Users", value: stats?.users || 0, icon: <TeamOutlined />, color: "#51cf66" },
  ];

  return (
    <div>
      <Title level={3} style={{ color: "var(--text-primary)", marginBottom: 24 }}>
        Admin Dashboard
      </Title>
      <Row gutter={[24, 24]}>
        {cards.map((c) => (
          <Col xs={24} sm={12} lg={6} key={c.title}>
            <Card className="stat-card" variant="borderless">
              <Statistic
                title={c.title}
                value={c.value}
                prefix={c.icon}
                styles={{ content: { color: c.color } }}
              />
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}
