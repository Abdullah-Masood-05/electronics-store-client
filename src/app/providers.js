"use client";

import { ConfigProvider, theme, App } from "antd";
import { AuthProvider } from "../context/AuthContext";
import { CartProvider } from "../context/CartContext";
import { WishlistProvider } from "../context/WishlistContext";
import Header from "../components/nav/Header";

const darkTheme = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: "#2997FF",
    colorBgBase: "#0B0B0B",
    colorBgContainer: "#171717",
    colorBgElevated: "#1F1F1F",
    colorBorder: "rgba(255,255,255,0.06)",
    borderRadius: 10,
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    fontSize: 14,
  },
  components: {
    Table: { headerBg: "#121212", rowHoverBg: "#1F1F1F" },
    Input: { activeBorderColor: "#2997FF", hoverBorderColor: "rgba(255,255,255,0.15)" },
    Select: { optionSelectedBg: "rgba(41,151,255,0.12)" },
    Modal: { contentBg: "#171717", headerBg: "#171717" },
    Card: { colorBgContainer: "#171717" },
  },
};

export default function ClientProviders({ children }) {
  return (
    <ConfigProvider theme={darkTheme}>
      <App>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <Header />
              <main className="app-content">{children}</main>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </App>
    </ConfigProvider>
  );
}
