"use client";

import { useEffect, useState } from "react";
import { Table, Button, App, Typography, Space, Popconfirm, Image, Tag } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import Link from "next/link";
import { getProducts, removeProduct } from "../../../services/product.service";

const { Title } = Typography;

export default function ProductPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const { message } = App.useApp();

  const loadProducts = async (p = 1) => {
    setLoading(true);
    try {
      const data = await getProducts(p, 10);
      setProducts(data.products);
      setTotal(data.total);
      setPage(data.page);
    } catch (err) {
      message.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleDelete = async (slug) => {
    try {
      await removeProduct(slug);
      message.success("Product deleted");
      loadProducts(page);
    } catch (err) {
      message.error(err.response?.data?.message || "Delete failed");
    }
  };

  const columns = [
    {
      title: "Image",
      dataIndex: "images",
      key: "image",
      width: 80,
      render: (images) =>
        images?.[0]?.url ? (
          <Image src={images[0].url} width={50} height={50} style={{ objectFit: "cover", borderRadius: 6 }} alt="" />
        ) : (
          <div style={{ width: 50, height: 50, background: "var(--bg-input)", borderRadius: 6 }} />
        ),
    },
    { title: "Title", dataIndex: "title", key: "title", ellipsis: true },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      width: 100,
      render: (p) => `$${p?.toFixed(2)}`,
    },
    { title: "Qty", dataIndex: "quantity", key: "quantity", width: 70 },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      render: (c) => c?.name || "—",
    },
    {
      title: "Shipping",
      dataIndex: "shipping",
      key: "shipping",
      width: 90,
      render: (s) => <Tag color={s ? "green" : "default"}>{s ? "Yes" : "No"}</Tag>,
    },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      render: (_, record) => (
        <Space>
          <Link href={`/admin/product/${record.slug}`}>
            <Button type="text" icon={<EditOutlined />} size="small" />
          </Link>
          <Popconfirm
            title="Delete this product?"
            onConfirm={() => handleDelete(record.slug)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="text" danger icon={<DeleteOutlined />} size="small" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <Title level={3} style={{ color: "var(--text-primary)", margin: 0 }}>
          Products
        </Title>
        <Link href="/admin/product/create">
          <Button type="primary" icon={<PlusOutlined />} id="create-product-btn">
            Add Product
          </Button>
        </Link>
      </div>

      <Table
        columns={columns}
        dataSource={products}
        rowKey="_id"
        loading={loading}
        className="admin-table"
        pagination={{
          current: page,
          total,
          pageSize: 10,
          onChange: (p) => loadProducts(p),
          showSizeChanger: false,
        }}
      />
    </div>
  );
}
