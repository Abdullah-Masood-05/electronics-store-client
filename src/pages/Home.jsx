import React from "react";
import { Typography, Card, Row, Col, Tag, Avatar, Statistic } from "antd";
import {
  UserOutlined,
  ShoppingCartOutlined,
  HeartOutlined,
  SafetyCertificateOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import useAuth from "../hooks/useAuth";

const { Title, Text } = Typography;

const Home = () => {
  const { backendUser, firebaseUser } = useAuth();

  const memberSince = backendUser?.createdAt
    ? new Date(backendUser.createdAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
    : "N/A";

  return (
    <div className="home-page">
      <div className="home-container">
        {/* Welcome Section */}
        <div className="welcome-section">
          <Title level={2} className="welcome-title">
            Welcome, {backendUser?.name || "User"} 👋
          </Title>
          <Text className="welcome-subtitle">
            Here's your ElectroStore dashboard
          </Text>
        </div>

        {/* Stats Row */}
        <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
          <Col xs={24} sm={8}>
            <Card className="stat-card" bordered={false}>
              <Statistic
                title="Cart Items"
                value={backendUser?.cart?.length || 0}
                prefix={<ShoppingCartOutlined />}
                valueStyle={{ color: "var(--accent-primary)" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card className="stat-card" bordered={false}>
              <Statistic
                title="Wishlist"
                value={backendUser?.wishlist?.length || 0}
                prefix={<HeartOutlined />}
                valueStyle={{ color: "#ff6b6b" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card className="stat-card" bordered={false}>
              <Statistic
                title="Account Status"
                value="Active"
                prefix={<SafetyCertificateOutlined />}
                valueStyle={{ color: "#51cf66" }}
              />
            </Card>
          </Col>
        </Row>

        {/* Profile Card */}
        <Card className="profile-card" bordered={false}>
          <div className="profile-header">
            <Avatar
              size={72}
              icon={<UserOutlined />}
              className="profile-avatar"
            />
            <div className="profile-info">
              <Title level={4} style={{ margin: 0, color: "var(--text-primary)" }}>
                {backendUser?.name || "User"}
              </Title>
              <Text type="secondary">{backendUser?.email}</Text>
              <div style={{ marginTop: 8 }}>
                <Tag color={backendUser?.role === "admin" ? "gold" : "blue"}>
                  {backendUser?.role?.toUpperCase() || "USER"}
                </Tag>
              </div>
            </div>
          </div>

          <div className="profile-details">
            <div className="profile-detail-item">
              <CalendarOutlined />
              <Text type="secondary">Member since {memberSince}</Text>
            </div>
            <div className="profile-detail-item">
              <UserOutlined />
              <Text type="secondary">
                Firebase UID: {firebaseUser?.uid?.slice(0, 12)}...
              </Text>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Home;
