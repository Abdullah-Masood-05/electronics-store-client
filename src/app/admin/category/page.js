"use client";

import { useEffect, useState } from "react";
import { Table, Button, Modal, Input, App, Typography, Space, Popconfirm } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import {
  getCategories,
  createCategory,
  updateCategory,
  removeCategory,
} from "../../../services/category.service";

const { Title } = Typography;

export default function CategoryPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSlug, setEditingSlug] = useState(null);
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { message } = App.useApp();

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await getCategories();
      setCategories(data.categories);
    } catch (err) {
      message.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const openCreate = () => {
    setEditingSlug(null);
    setName("");
    setModalOpen(true);
  };

  const openEdit = (record) => {
    setEditingSlug(record.slug);
    setName(record.name);
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!name.trim()) return message.warning("Name is required");
    setSubmitting(true);
    try {
      if (editingSlug) {
        await updateCategory(editingSlug, { name: name.trim() });
        message.success("Category updated");
      } else {
        await createCategory({ name: name.trim() });
        message.success("Category created");
      }
      setModalOpen(false);
      setName("");
      loadCategories();
    } catch (err) {
      message.error(err.response?.data?.message || "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (slug) => {
    try {
      await removeCategory(slug);
      message.success("Category deleted");
      loadCategories();
    } catch (err) {
      message.error(err.response?.data?.message || "Delete failed");
    }
  };

  const columns = [
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Slug", dataIndex: "slug", key: "slug" },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (d) => new Date(d).toLocaleDateString(),
    },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => openEdit(record)}
            size="small"
          />
          <Popconfirm
            title="Delete this category?"
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
          Categories
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate} id="create-category-btn">
          Add Category
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={categories}
        rowKey="_id"
        loading={loading}
        pagination={false}
        className="admin-table"
      />

      <Modal
        title={editingSlug ? "Edit Category" : "Add Category"}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        confirmLoading={submitting}
        okText={editingSlug ? "Update" : "Create"}
      >
        <Input
          placeholder="Category name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onPressEnter={handleSubmit}
          id="category-name-input"
          style={{ marginTop: 16 }}
        />
      </Modal>
    </div>
  );
}
