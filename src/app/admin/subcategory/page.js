"use client";

import { useEffect, useState } from "react";
import { Table, Button, Modal, Input, Select, App, Typography, Space, Popconfirm } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import {
  getSubCategories,
  createSubCategory,
  updateSubCategory,
  removeSubCategory,
} from "../../../services/subcategory.service";
import { getCategories } from "../../../services/category.service";

const { Title } = Typography;

export default function SubCategoryPage() {
  const [subs, setSubs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSlug, setEditingSlug] = useState(null);
  const [name, setName] = useState("");
  const [parent, setParent] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const { message } = App.useApp();

  const loadData = async () => {
    setLoading(true);
    try {
      const [subsData, catsData] = await Promise.all([
        getSubCategories(),
        getCategories(),
      ]);
      setSubs(subsData.subcategories);
      setCategories(catsData.categories);
    } catch (err) {
      message.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreate = () => {
    setEditingSlug(null);
    setName("");
    setParent(null);
    setModalOpen(true);
  };

  const openEdit = (record) => {
    setEditingSlug(record.slug);
    setName(record.name);
    setParent(record.parent?._id || record.parent);
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!name.trim()) return message.warning("Name is required");
    if (!parent) return message.warning("Parent category is required");
    setSubmitting(true);
    try {
      if (editingSlug) {
        await updateSubCategory(editingSlug, { name: name.trim(), parent });
        message.success("Sub-category updated");
      } else {
        await createSubCategory({ name: name.trim(), parent });
        message.success("Sub-category created");
      }
      setModalOpen(false);
      loadData();
    } catch (err) {
      message.error(err.response?.data?.message || "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (slug) => {
    try {
      await removeSubCategory(slug);
      message.success("Sub-category deleted");
      loadData();
    } catch (err) {
      message.error(err.response?.data?.message || "Delete failed");
    }
  };

  const columns = [
    { title: "Name", dataIndex: "name", key: "name" },
    {
      title: "Parent Category",
      dataIndex: "parent",
      key: "parent",
      render: (p) => p?.name || "—",
    },
    { title: "Slug", dataIndex: "slug", key: "slug" },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      render: (_, record) => (
        <Space>
          <Button type="text" icon={<EditOutlined />} onClick={() => openEdit(record)} size="small" />
          <Popconfirm
            title="Delete this sub-category?"
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
          Sub-categories
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate} id="create-subcategory-btn">
          Add Sub-category
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={subs}
        rowKey="_id"
        loading={loading}
        pagination={false}
        className="admin-table"
      />

      <Modal
        title={editingSlug ? "Edit Sub-category" : "Add Sub-category"}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        confirmLoading={submitting}
        okText={editingSlug ? "Update" : "Create"}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 16 }}>
          <Select
            placeholder="Select parent category"
            value={parent}
            onChange={setParent}
            options={categories.map((c) => ({ label: c.name, value: c._id }))}
            id="subcategory-parent-select"
          />
          <Input
            placeholder="Sub-category name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onPressEnter={handleSubmit}
            id="subcategory-name-input"
          />
        </div>
      </Modal>
    </div>
  );
}
