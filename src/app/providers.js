"use client";

import { ConfigProvider, theme, Layout, App } from "antd";
import { AuthProvider } from "../context/AuthContext";
import { CartProvider } from "../context/CartContext";
import Header from "../components/nav/Header";

const { Content } = Layout;

const darkTheme = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: "#4f6ef7",
    colorBgBase: "#0a0e1a",
    colorBgContainer: "#111827",
    borderRadius: 10,
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  },
};

export default function ClientProviders({ children }) {
  return (
    <ConfigProvider theme={darkTheme}>
      <App>
        <AuthProvider>
          <CartProvider>
            <Layout className="app-layout">
              <Header />
              <Content className="app-content">{children}</Content>
            </Layout>
          </CartProvider>
        </AuthProvider>
      </App>
    </ConfigProvider>
  );
}

