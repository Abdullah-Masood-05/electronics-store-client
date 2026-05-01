"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Dropdown } from "antd";
import { LogoutOutlined, UserOutlined, SettingOutlined } from "@ant-design/icons";
import useAuth from "../../hooks/useAuth";
import useCart from "../../context/CartContext";
import "./Header.css";

const categoryNav = [
  { href: "/products?category=phones", label: "Phones" },
  { href: "/products?category=laptops", label: "Laptops" },
  { href: "/products?category=audio", label: "Audio" },
  { href: "/products?category=gaming", label: "Gaming" },
  { href: "/products?category=accessories", label: "Accessories" },
  { href: "/deals", label: "Deals" },
];

const Header = () => {
  const { isAuthenticated, backendUser, logout, loading } = useAuth();
  const { cartCount } = useCart();
  const router = useRouter();
  const pathname = usePathname();
  const [searchValue, setSearchValue] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const searchRef = useRef(null);

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchValue.trim()) {
      router.push(`/products?keyword=${encodeURIComponent(searchValue.trim())}`);
      setSearchValue("");
    }
  };

  const getInitial = (name) => name?.charAt(0)?.toUpperCase() || "U";

  const userMenuItems = [
    {
      key: "info",
      label: (
        <div className="user-menu-info">
          <div className="user-menu-name">{backendUser?.name || "User"}</div>
          <div className="user-menu-email">{backendUser?.email}</div>
        </div>
      ),
      disabled: true,
    },
    { type: "divider" },
    ...(backendUser?.role === "admin"
      ? [
          {
            key: "admin",
            icon: <SettingOutlined />,
            label: "Admin Panel",
            onClick: () => router.push("/admin/dashboard"),
          },
          { type: "divider" },
        ]
      : []),
    {
      key: "orders",
      icon: <UserOutlined />,
      label: "My Orders",
      onClick: () => router.push("/orders"),
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

  return (
    <header className="site-header">
      {/* Row 1: Main Nav */}
      <div className="nav-main">
        <div className="nav-main-inner container">
          {/* Logo */}
          <Link href="/" className="nav-logo" id="site-logo">
            <span className="nav-logo-mark">⚡</span>
            <span className="nav-logo-text">ElectroStore</span>
          </Link>

          {/* Search */}
          {isAuthenticated && (
            <form className="nav-search" onSubmit={handleSearch}>
              <svg className="nav-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                ref={searchRef}
                type="text"
                placeholder="Search phones, laptops, accessories..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="nav-search-input"
                id="nav-search-input"
              />
            </form>
          )}

          {/* Right Actions */}
          <div className="nav-actions">
            {loading ? null : isAuthenticated ? (
              <>
                {/* Account */}
                <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={["click"]}>
                  <button className="nav-action-btn" id="nav-account" title="Account">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </button>
                </Dropdown>

                {/* Wishlist */}
                <button className="nav-action-btn" id="nav-wishlist" title="Wishlist" onClick={() => router.push("/wishlist")}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                  </svg>
                </button>

                {/* Cart */}
                <button className="nav-action-btn nav-cart-btn" id="nav-cart" title="Cart" onClick={() => router.push("/cart")}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <path d="M16 10a4 4 0 01-8 0" />
                  </svg>
                  {cartCount > 0 && (
                    <span className="nav-cart-badge">{cartCount}</span>
                  )}
                </button>

                {/* Mobile Toggle */}
                <button className="nav-action-btn mobile-only" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    {mobileMenuOpen ? (
                      <path d="M18 6L6 18M6 6l12 12" />
                    ) : (
                      <path d="M3 12h18M3 6h18M3 18h18" />
                    )}
                  </svg>
                </button>
              </>
            ) : (
              <div className="nav-auth">
                <Link href="/login" className="btn btn-outline btn-sm" id="nav-login">Sign In</Link>
                <Link href="/register" className="btn btn-primary btn-sm" id="nav-register">Sign Up</Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Row 2: Category Nav */}
      {isAuthenticated && (
        <nav className={`nav-categories ${mobileMenuOpen ? "open" : ""}`}>
          <div className="nav-categories-inner container">
            {categoryNav.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="nav-cat-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
};

export default Header;
