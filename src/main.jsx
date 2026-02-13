import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ConfigProvider, theme } from "antd";
import "./index.css";
import App from "./App.jsx";

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

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ConfigProvider theme={darkTheme}>
      <App />
    </ConfigProvider>
  </StrictMode>
);
