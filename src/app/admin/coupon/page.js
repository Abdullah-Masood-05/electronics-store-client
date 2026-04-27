"use client";

import { useEffect, useState } from "react";
import { Table, Button, Modal, Input, InputNumber, DatePicker, Typography, App, Popconfirm } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import AdminGuard from "../../../components/AdminGuard";
import { getCoupons, createCoupon, removeCoupon } from "../../../services/coupon.service";
import "../../../styles/admin.css";

const { Title } = Typography;

function AdminCouponsContent() {
  const { message } = App.useApp();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [form, setForm] = useState({ code: "", discount: 10, expiry: null });

  const load = () => {
    setLoading(true);
    getCoupons()
      .then((data) => setCoupons(data.coupons || []))
      .catch(() => setCoupons([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!form.code || !form.expiry) {
      message.error("Code and expiry are required");
      return;
    }
    setFormLoading(true);
    try {
      await createCoupon({
        code: form.code,
        discount: form.discount,
        expiry: form.expiry,
      });
      message.success("Coupon created");
      setModalOpen(false);
      setForm({ code: "", discount: 10, expiry: null });
      load();
    } catch (err) {
      message.error(err.response?.data?.message || "Failed");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await removeCoupon(id);
      message.success("Coupon deleted");
      load();
    } catch {
      message.error("Failed to delete");
    }
  };

  const columns = [
    { title: "Code", dataIndex: "code", render: (c) => <strong>{c}</strong> },
    { title: "Discount", dataIndex: "discount", render: (d) => `${d}%` },
    {
      title: "Expiry",
      dataIndex: "expiry",
      render: (d) =>
        new Date(d).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
    },
    { title: "Created By", dataIndex: "createdBy", render: (u) => u?.name || "—" },
    {
      title: "Action",
      render: (_, record) => (
        <Popconfirm title="Delete this coupon?" onConfirm={() => handleDelete(record._id)}>
          <Button danger icon={<DeleteOutlined />} size="small" />
        </Popconfirm>
      ),
    },
  ];

  return (
    <div>
      <div className="admin-page-header">
        <Title level={3} className="admin-page-title">Coupons</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setModalOpen(true)}
          id="create-coupon"
        >
          Create Coupon
        </Button>
      </div>

      <Table
        dataSource={coupons}
        columns={columns}
        rowKey="_id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title="Create Coupon"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleCreate}
        confirmLoading={formLoading}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 16 }}>
          <div>
            <label>Code</label>
            <Input
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              placeholder="SAVE20"
              id="coupon-code"
            />
          </div>
          <div>
            <label>Discount (%)</label>
            <InputNumber
              min={1}
              max={100}
              value={form.discount}
              onChange={(v) => setForm({ ...form, discount: v })}
              style={{ width: "100%" }}
              id="coupon-discount"
            />
          </div>
          <div>
            <label>Expiry Date</label>
            <DatePicker
              style={{ width: "100%" }}
              onChange={(_, dateStr) => setForm({ ...form, expiry: dateStr })}
              id="coupon-expiry"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default function AdminCouponsPage() {
  return (
    <AdminGuard>
      <AdminCouponsContent />
    </AdminGuard>
  );
}
