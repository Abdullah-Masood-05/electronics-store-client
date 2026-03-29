"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Dropdown } from "antd";
import { LogoutOutlined, UserOutlined } from "@ant-design/icons";
import useAuth from "../../hooks/useAuth";
import "./Header.css";

const Header = () => {
  const { isAuthenticated, backendUser, logout, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  const userMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: (
        <div>
          <div style={{ fontWeight: 600 }}>{backendUser?.name || "User"}</div>
          <div style={{ fontSize: 12, opacity: 0.7 }}>{backendUser?.email}</div>
        </div>
      ),
      disabled: true,
    },
    { type: "divider" },
    ...(backendUser?.role === "admin"
      ? [
          {
            key: "admin",
            icon: <UserOutlined />,
            label: "Admin Dashboard",
            onClick: () => router.push("/admin/dashboard"),
          },
          { type: "divider" },
        ]
      : []),
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Sign Out",
      danger: true,
      onClick: handleLogout,
    },
  ];

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/products", label: "Products" },
    { href: "/deals", label: "Deals" },
    { href: "/orders", label: "Orders" },
  ];

  const getInitial = (name) => name?.charAt(0)?.toUpperCase() || "U";

  return (
    <header className="app-header">
      <div className="header-content">
        {/* Logo */}
        <Link href="/" className="header-logo">
          <span className="logo-icon">⚡</span>
          <span className="logo-text">ElectroStore</span>
        </Link>

        {/* Pill Navigation */}
        {isAuthenticated && (
          <nav className="header-pill-nav">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={pathname === link.href ? "active" : ""}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}

        {/* Right Section */}
        <div className="header-icons">
          {loading ? null : isAuthenticated ? (
            <>
              {/* Search */}
              <button className="header-icon-btn" title="Search" id="header-search">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </button>

              {/* Cart */}
              <button className="header-icon-btn" title="Cart" id="header-cart" onClick={() => router.push("/cart")}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 01-8 0" />
                </svg>
                <span className="header-cart-badge">
                  {backendUser?.cart?.length || 0}
                </span>
              </button>

              {/* Bell */}
              <button className="header-icon-btn" title="Notifications" id="header-notifications">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 01-3.46 0" />
                </svg>
              </button>

              {/* Avatar Dropdown */}
              <Dropdown
                menu={{ items: userMenuItems }}
                placement="bottomRight"
                trigger={["click"]}
              >
                <div className="header-avatar" id="user-menu-trigger">
                  {getInitial(backendUser?.name)}
                </div>
              </Dropdown>
            </>
          ) : (
            <div className="header-auth-btns">
              <Link href="/login">
                <button className="btn-outline" id="header-login-btn">Sign In</button>
              </Link>
              <Link href="/register">
                <button className="btn-primary" id="header-register-btn">Sign Up</button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
