"use client";

import { useEffect, useState } from "react";
import { Table, Tag, Select, Typography, App } from "antd";
import AdminGuard from "../../../components/AdminGuard";
import { getAllOrders, updateOrderStatus } from "../../../services/order.service";
import "../../../styles/admin.css";

const { Title } = Typography;

const statusOptions = [
  "Not Processed",
  "Processing",
  "Dispatched",
  "Cancelled",
  "Completed",
];

const statusColors = {
  "Not Processed": "default",
  Processing: "processing",
  Dispatched: "blue",
  Cancelled: "red",
  Completed: "green",
};

function AdminOrdersContent() {
  const { message } = App.useApp();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    getAllOrders()
      .then((data) => setOrders(data.orders || []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleStatusChange = async (orderId, status) => {
    try {
      await updateOrderStatus(orderId, status);
      message.success("Status updated");
      load();
    } catch {
      message.error("Failed to update status");
    }
  };

  const columns = [
    {
      title: "Order ID",
      dataIndex: "_id",
      render: (id) => <code>{id.slice(-8)}</code>,
      width: 100,
    },
    {
      title: "Customer",
      dataIndex: "orderedBy",
      render: (u) => u?.name || u?.email || "—",
    },
    {
      title: "Products",
      dataIndex: "products",
      render: (products) => (
        <div>
          {products.map((p, i) => (
            <div key={i} style={{ fontSize: 12 }}>
              {p.product?.title || "?"} × {p.count}
            </div>
          ))}
        </div>
      ),
    },
    {
      title: "Total",
      dataIndex: "totalAmount",
      render: (amt) => <strong>${amt?.toFixed(2)}</strong>,
      width: 100,
    },
    {
      title: "Payment",
      dataIndex: "paymentMethod",
      render: (m) => (
        <Tag color={m === "stripe" ? "purple" : "gold"}>
          {m === "stripe" ? "Card" : "COD"}
        </Tag>
      ),
      width: 90,
    },
    {
      title: "Status",
      dataIndex: "orderStatus",
      render: (status, record) => (
        <Select
          value={status}
          onChange={(v) => handleStatusChange(record._id, v)}
          style={{ width: 150 }}
          options={statusOptions.map((s) => ({
            label: <Tag color={statusColors[s]}>{s}</Tag>,
            value: s,
          }))}
          size="small"
        />
      ),
      width: 170,
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      render: (d) =>
        new Date(d).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
      width: 120,
    },
  ];

  return (
    <div>
      <div className="admin-page-header">
        <Title level={3} className="admin-page-title">Orders</Title>
      </div>

      <Table
        dataSource={orders}
        columns={columns}
        rowKey="_id"
        loading={loading}
        pagination={{ pageSize: 15 }}
        scroll={{ x: 900 }}
      />
    </div>
  );
}

export default function AdminOrdersPage() {
  return (
    <AdminGuard>
      <AdminOrdersContent />
    </AdminGuard>
  );
}
