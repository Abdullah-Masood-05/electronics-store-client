"use client";

import { useEffect, useState } from "react";
import { Typography, Spin, Empty, Tag, Table } from "antd";
import Link from "next/link";
import AuthGuard from "../../components/AuthGuard";
import { getUserOrders } from "../../services/order.service";
import "../../styles/cart.css";

const { Title, Text } = Typography;

const statusColors = {
  "Not Processed": "default",
  Processing: "processing",
  Dispatched: "blue",
  Cancelled: "red",
  Completed: "green",
};

function OrdersContent() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserOrders()
      .then((data) => setOrders(data.orders || []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  const columns = [
    {
      title: "Order ID",
      dataIndex: "_id",
      render: (id) => <Text copyable className="order-id">{id.slice(-8)}</Text>,
    },
    {
      title: "Products",
      dataIndex: "products",
      render: (products) => (
        <div>
          {products.map((p, i) => (
            <div key={i} style={{ fontSize: 13 }}>
              {p.product?.title || "Product"} × {p.count}
            </div>
          ))}
        </div>
      ),
    },
    {
      title: "Total",
      dataIndex: "totalAmount",
      render: (amt) => <Text strong>${amt?.toFixed(2)}</Text>,
    },
    {
      title: "Payment",
      dataIndex: "paymentMethod",
      render: (m) => (
        <Tag color={m === "stripe" ? "purple" : "gold"}>
          {m === "stripe" ? "Card" : "COD"}
        </Tag>
      ),
    },
    {
      title: "Status",
      dataIndex: "orderStatus",
      render: (s) => <Tag color={statusColors[s]}>{s}</Tag>,
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      render: (d) =>
        new Date(d).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
    },
  ];

  return (
    <div className="cart-page">
      <Title level={2} className="cart-title">My Orders</Title>

      {loading ? (
        <div className="cart-loading"><Spin size="large" /></div>
      ) : orders.length === 0 ? (
        <div className="cart-empty">
          <Empty description={<Text className="cart-empty-text">No orders yet</Text>} />
          <Link href="/products">
            <button className="btn-primary">Shop Now</button>
          </Link>
        </div>
      ) : (
        <Table
          dataSource={orders}
          columns={columns}
          rowKey="_id"
          pagination={{ pageSize: 10 }}
          scroll={{ x: 600 }}
        />
      )}
    </div>
  );
}

export default function OrdersPage() {
  return (
    <AuthGuard>
      <OrdersContent />
    </AuthGuard>
  );
}
