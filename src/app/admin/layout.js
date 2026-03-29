"use client";

import { Layout } from "antd";
import AdminGuard from "../../components/AdminGuard";
import AdminNav from "../../components/AdminNav";

const { Sider, Content } = Layout;

export default function AdminLayout({ children }) {
  return (
    <AdminGuard>
      <Layout className="admin-layout">
        <Sider width={240} className="admin-sidebar" breakpoint="lg" collapsedWidth={0}>
          <div className="admin-sidebar-title">Admin Panel</div>
          <AdminNav />
        </Sider>
        <Content className="admin-content">{children}</Content>
      </Layout>
    </AdminGuard>
  );
}
