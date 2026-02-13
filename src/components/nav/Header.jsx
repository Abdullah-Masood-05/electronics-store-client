import React from "react";
import { Layout, Menu, Button, Dropdown, Avatar, Space, Typography } from "antd";
import {
  UserOutlined,
  LogoutOutlined,
  HomeOutlined,
  ShoppingOutlined,
  LoginOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import { Link, useNavigate, useLocation } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

const { Header: AntHeader } = Layout;
const { Text } = Typography;

const Header = () => {
  const { isAuthenticated, backendUser, logout, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  // User dropdown menu items
  const userMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: (
        <div>
          <div style={{ fontWeight: 600 }}>{backendUser?.name || "User"}</div>
          <div style={{ fontSize: 12, opacity: 0.7 }}>
            {backendUser?.email}
          </div>
        </div>
      ),
      disabled: true,
    },
    { type: "divider" },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Sign Out",
      danger: true,
      onClick: handleLogout,
    },
  ];

  // Nav menu items
  const navItems = isAuthenticated
    ? [
      {
        key: "/",
        icon: <HomeOutlined />,
        label: <Link to="/">Home</Link>,
      },
      {
        key: "/products",
        icon: <ShoppingOutlined />,
        label: "Products",
        disabled: true,
      },
    ]
    : [];

  const selectedKey = location.pathname;

  return (
    <AntHeader className="app-header">
      <div className="header-content">
        {/* Logo */}
        <Link to="/" className="header-logo">
          <span className="logo-icon">⚡</span>
          <span className="logo-text">ElectroStore</span>
        </Link>

        {/* Navigation */}
        {isAuthenticated && (
          <Menu
            theme="dark"
            mode="horizontal"
            selectedKeys={[selectedKey]}
            items={navItems}
            className="header-nav"
            style={{ flex: 1, minWidth: 0, background: "transparent", borderBottom: "none" }}
          />
        )}

        {/* Right Section */}
        <div className="header-actions">
          {loading ? null : isAuthenticated ? (
            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              trigger={["click"]}
            >
              <Space className="user-trigger" id="user-menu-trigger">
                <Avatar
                  size="small"
                  icon={<UserOutlined />}
                  style={{ backgroundColor: "var(--accent-primary)" }}
                />
                <Text className="user-name" ellipsis style={{ maxWidth: 120 }}>
                  {backendUser?.name || "User"}
                </Text>
              </Space>
            </Dropdown>
          ) : (
            <Space>
              <Link to="/login">
                <Button
                  type="text"
                  icon={<LoginOutlined />}
                  className="header-btn"
                  id="header-login-btn"
                >
                  Sign In
                </Button>
              </Link>
              <Link to="/register">
                <Button
                  type="primary"
                  icon={<UserAddOutlined />}
                  className="header-btn-primary"
                  id="header-register-btn"
                >
                  Sign Up
                </Button>
              </Link>
            </Space>
          )}
        </div>
      </div>
    </AntHeader>
  );
};

export default Header;