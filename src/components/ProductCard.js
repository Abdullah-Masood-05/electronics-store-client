"use client";

import { Card, Typography, Tag } from "antd";
import { StarFilled } from "@ant-design/icons";
import Link from "next/link";

const { Text, Title } = Typography;

const ProductCard = ({ product }) => {
  // Calculate average rating
  const avgRating =
    product.ratings?.length > 0
      ? (
          product.ratings.reduce((sum, r) => sum + r.star, 0) /
          product.ratings.length
        ).toFixed(1)
      : null;

  return (
    <Link href={`/products/${product.slug}`} className="product-card-link">
      <Card
        className="product-card"
        variant="borderless"
        cover={
          <div className="product-card-image">
            {product.images?.[0]?.url ? (
              <img src={product.images[0].url} alt={product.title} />
            ) : (
              <div className="product-card-placeholder">No Image</div>
            )}
          </div>
        }
      >
        <div className="product-card-body">
          <Text className="product-card-category">
            {product.category?.name || "Uncategorized"}
          </Text>
          <Title level={5} className="product-card-title" ellipsis={{ rows: 2 }}>
            {product.title}
          </Title>
          <div className="product-card-footer">
            <Text className="product-card-price">
              ${product.price?.toFixed(2)}
            </Text>
            {avgRating && (
              <div className="product-card-rating">
                <StarFilled style={{ color: "#fadb14", fontSize: 13 }} />
                <Text className="product-card-rating-text">
                  {avgRating} ({product.ratings.length})
                </Text>
              </div>
            )}
          </div>
          {product.shipping && (
            <Tag color="green" className="product-card-shipping">
              Free Shipping
            </Tag>
          )}
        </div>
      </Card>
    </Link>
  );
};

export default ProductCard;
