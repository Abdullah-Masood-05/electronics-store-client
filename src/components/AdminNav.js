"use client";

import { Menu } from "antd";
import {
  DashboardOutlined,
  AppstoreOutlined,
  TagsOutlined,
  ShoppingOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  {
    key: "/admin/dashboard",
    icon: <DashboardOutlined />,
    label: <Link href="/admin/dashboard">Dashboard</Link>,
  },
  {
    key: "/admin/category",
    icon: <AppstoreOutlined />,
    label: <Link href="/admin/category">Categories</Link>,
  },
  {
    key: "/admin/subcategory",
    icon: <TagsOutlined />,
    label: <Link href="/admin/subcategory">Sub-categories</Link>,
  },
  {
    key: "/admin/product",
    icon: <ShoppingOutlined />,
    label: <Link href="/admin/product">Products</Link>,
  },
];

const AdminNav = () => {
  const pathname = usePathname();

  // Match the closest menu key
  const selectedKey = items
    .map((i) => i.key)
    .filter((k) => pathname.startsWith(k))
    .sort((a, b) => b.length - a.length)[0] || "/admin/dashboard";

  return (
    <Menu
      mode="inline"
      selectedKeys={[selectedKey]}
      items={items}
      className="admin-sidebar-menu"
      style={{ background: "transparent", borderRight: "none" }}
    />
  );
};

export default AdminNav;
