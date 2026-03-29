"use client";

import { useEffect, useState } from "react";
import {
  Form,
  Input,
  InputNumber,
  Select,
  Switch,
  Button,
  Upload,
  Typography,
  Card,
  App,
  Image,
  Space,
} from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { createProduct } from "../../../../services/product.service";
import { getCategories } from "../../../../services/category.service";
import { getSubCategories } from "../../../../services/subcategory.service";
import { resizeImage } from "../../../../utils/imageResize";

const { Title, Text } = Typography;
const { TextArea } = Input;

export default function CreateProductPage() {
  const [form] = Form.useForm();
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [images, setImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const { message } = App.useApp();

  useEffect(() => {
    getCategories()
      .then((data) => setCategories(data.categories))
      .catch(() => message.error("Failed to load categories"));
  }, []);

  const handleCategoryChange = async (categoryId) => {
    form.setFieldValue("subcategories", []);
    try {
      const data = await getSubCategories(categoryId);
      setSubcategories(data.subcategories);
    } catch {
      setSubcategories([]);
    }
  };

  const handleImageUpload = async (info) => {
    const file = info.file;
    if (!file) return;

    try {
      const resized = await resizeImage(file, 720, 0.8);
      setImages((prev) => [
        ...prev,
        { url: resized, public_id: `${Date.now()}_${file.name}` },
      ]);
    } catch {
      message.error("Image processing failed");
    }
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const onFinish = async (values) => {
    if (images.length === 0) {
      return message.warning("Please add at least one image");
    }
    setSubmitting(true);
    try {
      await createProduct({ ...values, images });
      message.success("Product created");
      router.push("/admin/product");
    } catch (err) {
      message.error(err.response?.data?.message || "Failed to create product");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <Title level={3} style={{ color: "var(--text-primary)", marginBottom: 24 }}>
        Create Product
      </Title>

      <Card variant="borderless" className="admin-form-card">
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          requiredMark={false}
          initialValues={{ shipping: false, quantity: 1 }}
        >
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: "Title is required" }]}
          >
            <Input placeholder="Product title" id="product-title" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: "Description is required" }]}
          >
            <TextArea rows={4} placeholder="Product description" id="product-description" maxLength={2000} showCount />
          </Form.Item>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Form.Item
              name="price"
              label="Price ($)"
              rules={[{ required: true, message: "Price is required" }]}
            >
              <InputNumber min={0} step={0.01} style={{ width: "100%" }} placeholder="0.00" id="product-price" />
            </Form.Item>

            <Form.Item
              name="quantity"
              label="Quantity"
              rules={[{ required: true, message: "Quantity is required" }]}
            >
              <InputNumber min={0} style={{ width: "100%" }} placeholder="1" id="product-quantity" />
            </Form.Item>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Form.Item
              name="category"
              label="Category"
              rules={[{ required: true, message: "Category is required" }]}
            >
              <Select
                placeholder="Select category"
                options={categories.map((c) => ({ label: c.name, value: c._id }))}
                onChange={handleCategoryChange}
                id="product-category"
              />
            </Form.Item>

            <Form.Item name="subcategories" label="Sub-categories">
              <Select
                mode="multiple"
                placeholder="Select sub-categories"
                options={subcategories.map((s) => ({ label: s.name, value: s._id }))}
                id="product-subcategories"
              />
            </Form.Item>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
            <Form.Item name="brand" label="Brand">
              <Input placeholder="Brand name" id="product-brand" />
            </Form.Item>

            <Form.Item name="color" label="Color">
              <Input placeholder="e.g. Black, Silver" id="product-color" />
            </Form.Item>

            <Form.Item name="shipping" label="Shipping" valuePropName="checked">
              <Switch id="product-shipping" />
            </Form.Item>
          </div>

          {/* Image Upload */}
          <Form.Item label="Images">
            <div className="image-upload-area">
              {images.map((img, idx) => (
                <div key={img.public_id} className="image-preview-item">
                  <Image src={img.url} width={100} height={100} style={{ objectFit: "cover", borderRadius: 8 }} alt="" />
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    size="small"
                    className="image-remove-btn"
                    onClick={() => removeImage(idx)}
                  />
                </div>
              ))}
              <Upload
                showUploadList={false}
                beforeUpload={() => false}
                onChange={handleImageUpload}
                accept="image/*"
                multiple
              >
                <div className="image-upload-trigger">
                  <PlusOutlined />
                  <Text type="secondary" style={{ fontSize: 12, marginTop: 4 }}>Upload</Text>
                </div>
              </Upload>
            </div>
          </Form.Item>

          <Space style={{ marginTop: 8 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
              disabled={submitting}
              id="product-submit"
            >
              Create Product
            </Button>
            <Button onClick={() => router.back()}>Cancel</Button>
          </Space>
        </Form>
      </Card>
    </div>
  );
}
