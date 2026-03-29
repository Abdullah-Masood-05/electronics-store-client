"use client";

import { useEffect, useState } from "react";
import {
  Typography,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Switch,
  App,
  Space,
  Tag,
  Popconfirm,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import {
  getAllDeals,
  createDeal,
  updateDeal,
  removeDeal,
} from "../../../services/deal.service";
import { getProducts } from "../../../services/product.service";

const { Title, Text } = Typography;

export default function AdminDealsPage() {
  const [deals, setDeals] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();
  const { message } = App.useApp();

  const loadDeals = async () => {
    setLoading(true);
    try {
      const data = await getAllDeals();
      setDeals(data.deals);
    } catch {
      message.error("Failed to load deals");
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const data = await getProducts(1, 200, "newest");
      setProducts(data.products || []);
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    loadDeals();
    loadProducts();
  }, []);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ active: true });
    setModalOpen(true);
  };

  const openEdit = (deal) => {
    setEditing(deal);
    form.setFieldsValue({
      title: deal.title,
      description: deal.description,
      price: deal.price,
      product: deal.product?._id || undefined,
      image: deal.image,
      active: deal.active,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      if (editing) {
        await updateDeal(editing._id, values);
        message.success("Deal updated");
      } else {
        await createDeal(values);
        message.success("Deal created");
      }
      setModalOpen(false);
      loadDeals();
    } catch (err) {
      message.error(err.response?.data?.message || "Failed to save deal");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await removeDeal(id);
      message.success("Deal deleted");
      loadDeals();
    } catch {
      message.error("Failed to delete deal");
    }
  };

  const columns = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      render: (text) => <Text strong style={{ color: "var(--text-primary)" }}>{text}</Text>,
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
    },
    {
      title: "Product",
      key: "product",
      render: (_, record) =>
        record.product?.title || <Text type="secondary">None</Text>,
    },
    {
      title: "Created By",
      key: "createdBy",
      render: (_, record) =>
        record.createdBy?.name || <Text type="secondary">Unknown</Text>,
    },
    {
      title: "Status",
      key: "active",
      render: (_, record) =>
        record.active ? (
          <Tag color="green">Active</Tag>
        ) : (
          <Tag color="default">Inactive</Tag>
        ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => openEdit(record)}
            size="small"
          />
          <Popconfirm
            title="Delete this deal?"
            onConfirm={() => handleDelete(record._id)}
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              size="small"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <Title level={3} style={{ color: "var(--text-primary)", margin: 0 }}>
          Deals
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={openCreate}
          id="create-deal-btn"
        >
          Create Deal
        </Button>
      </div>

      <Table
        dataSource={deals}
        columns={columns}
        rowKey="_id"
        loading={loading}
        className="admin-table"
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editing ? "Edit Deal" : "Create Deal"}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark={false}
        >
          <Form.Item
            name="title"
            label="Deal Title"
            rules={[{ required: true, message: "Title is required" }]}
          >
            <Input placeholder="e.g. MacBook Pro M3 Sale" id="deal-title" />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <Input.TextArea
              placeholder="Short description (optional)"
              rows={2}
              maxLength={200}
              showCount
              id="deal-description"
            />
          </Form.Item>

          <Form.Item
            name="price"
            label="Price Text"
            rules={[{ required: true, message: "Price is required" }]}
          >
            <Input placeholder="e.g. Starting at $1,299" id="deal-price" />
          </Form.Item>

          <Form.Item name="product" label="Link to Product (optional)">
            <Select
              placeholder="Select a product"
              allowClear
              showSearch
              optionFilterProp="label"
              options={products.map((p) => ({
                label: p.title,
                value: p._id,
              }))}
              id="deal-product"
            />
          </Form.Item>

          <Form.Item name="image" label="Image Emoji/URL (optional)">
            <Input placeholder="e.g. 💻 or https://..." id="deal-image" />
          </Form.Item>

          <Form.Item name="active" label="Active" valuePropName="checked">
            <Switch id="deal-active" />
          </Form.Item>

          <Space>
            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
              id="deal-submit"
            >
              {editing ? "Update" : "Create"}
            </Button>
            <Button onClick={() => setModalOpen(false)}>Cancel</Button>
          </Space>
        </Form>
      </Modal>
    </div>
  );
}
