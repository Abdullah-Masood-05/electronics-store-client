"use client";

import { useEffect, useState, use } from "react";
import {
  Typography,
  Spin,
  Carousel,
  Tag,
  Divider,
  Card,
  App,
  Breadcrumb,
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  TruckOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import { getProduct, submitRating } from "../../../services/product.service";
import StarRating from "../../../components/StarRating";
import useAuth from "../../../hooks/useAuth";

const { Title, Text, Paragraph } = Typography;

export default function ProductDetailPage({ params }) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ratingLoading, setRatingLoading] = useState(false);
  const { isAuthenticated, backendUser } = useAuth();
  const { message } = App.useApp();

  const loadProduct = async () => {
    try {
      const data = await getProduct(slug);
      setProduct(data.product);
    } catch {
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProduct();
  }, [slug]);

  const handleRating = async (star) => {
    if (!isAuthenticated) return message.info("Please log in to rate");
    setRatingLoading(true);
    try {
      const data = await submitRating(product._id, star);
      setProduct(data.product);
      message.success("Rating submitted!");
    } catch (err) {
      message.error(err.response?.data?.message || "Failed to submit rating");
    } finally {
      setRatingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="products-loading">
        <Spin size="large" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="products-page">
        <Title level={3} style={{ color: "var(--text-primary)" }}>
          Product not found
        </Title>
      </div>
    );
  }

  // Compute average rating
  const avgRating =
    product.ratings?.length > 0
      ? product.ratings.reduce((sum, r) => sum + r.star, 0) /
        product.ratings.length
      : 0;

  // Find current user's rating
  const userRating = product.ratings?.find(
    (r) => r.postedBy?._id === backendUser?._id
  );

  return (
    <div className="product-detail-page">
      <Breadcrumb
        className="product-breadcrumb"
        items={[
          { title: <Link href="/products">Products</Link> },
          ...(product.category
            ? [
                {
                  title: (
                    <Link href={`/products/category/${product.category.slug}`}>
                      {product.category.name}
                    </Link>
                  ),
                },
              ]
            : []),
          { title: product.title },
        ]}
      />

      <div className="product-detail-layout">
        {/* Image Carousel */}
        <div className="product-detail-images">
          {product.images?.length > 0 ? (
            <Carousel autoplay dots className="product-carousel">
              {product.images.map((img, idx) => (
                <div key={img.public_id || idx} className="product-carousel-slide">
                  <img src={img.url} alt={`${product.title} ${idx + 1}`} />
                </div>
              ))}
            </Carousel>
          ) : (
            <div className="product-carousel-placeholder">No Images</div>
          )}
        </div>

        {/* Product Info */}
        <div className="product-detail-info">
          <Title level={2} className="product-detail-title">
            {product.title}
          </Title>

          {/* Rating display */}
          <div className="product-detail-rating-display">
            <StarRating
              value={avgRating}
              readOnly
              totalRatings={product.ratings?.length || 0}
              size={22}
            />
          </div>

          <Title level={3} className="product-detail-price">
            ${product.price?.toFixed(2)}
          </Title>

          <Divider style={{ borderColor: "var(--border-color)" }} />

          <div className="product-detail-meta">
            {product.brand && (
              <div className="product-meta-row">
                <Text type="secondary">Brand</Text>
                <Text className="product-meta-value">{product.brand}</Text>
              </div>
            )}
            {product.color && (
              <div className="product-meta-row">
                <Text type="secondary">Color</Text>
                <Text className="product-meta-value">{product.color}</Text>
              </div>
            )}
            <div className="product-meta-row">
              <Text type="secondary">Category</Text>
              <Link href={`/products/category/${product.category?.slug}`}>
                <Tag color="blue">{product.category?.name}</Tag>
              </Link>
            </div>
            {product.subcategories?.length > 0 && (
              <div className="product-meta-row">
                <Text type="secondary">Sub-categories</Text>
                <div>
                  {product.subcategories.map((s) => (
                    <Link key={s._id} href={`/products/subcategory/${s.slug}`}>
                      <Tag color="purple" style={{ marginBottom: 4 }}>
                        {s.name}
                      </Tag>
                    </Link>
                  ))}
                </div>
              </div>
            )}
            <div className="product-meta-row">
              <Text type="secondary">Availability</Text>
              {product.quantity > 0 ? (
                <Tag icon={<CheckCircleOutlined />} color="success">
                  In Stock ({product.quantity})
                </Tag>
              ) : (
                <Tag icon={<CloseCircleOutlined />} color="error">
                  Out of Stock
                </Tag>
              )}
            </div>
            <div className="product-meta-row">
              <Text type="secondary">Shipping</Text>
              {product.shipping ? (
                <Tag icon={<TruckOutlined />} color="green">
                  Free Shipping
                </Tag>
              ) : (
                <Tag>Standard</Tag>
              )}
            </div>
          </div>

          <Divider style={{ borderColor: "var(--border-color)" }} />

          <Paragraph className="product-detail-description">
            {product.description}
          </Paragraph>

          {/* Rating Submit */}
          {isAuthenticated && (
            <Card
              variant="borderless"
              className="product-rating-card"
              title="Rate this product"
            >
              <StarRating
                value={userRating?.star || 0}
                onChange={handleRating}
                size={28}
              />
              {userRating && (
                <Text type="secondary" style={{ marginTop: 8, display: "block" }}>
                  Your rating: {userRating.star} star{userRating.star !== 1 ? "s" : ""}
                </Text>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
