import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "antd";
import { AuthProvider } from "./context/AuthContext";
import Header from "./components/nav/Header";
import PrivateRoute from "./routes/PrivateRoute";
import Login from "./features/auth/Login";
import Register from "./features/auth/Register";
import Home from "./pages/Home";

const { Content } = Layout;

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Layout className="app-layout">
          <Header />
          <Content className="app-content">
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected routes */}
              <Route element={<PrivateRoute />}>
                <Route path="/" element={<Home />} />
              </Route>
            </Routes>
          </Content>
        </Layout>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
