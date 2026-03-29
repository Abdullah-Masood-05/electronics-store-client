"use client";

import { useEffect, useState } from "react";
import { Row, Col, Select, Typography, Spin, Pagination, Empty } from "antd";
import ProductCard from "../../components/ProductCard";
import { getProducts } from "../../services/product.service";

const { Title } = Typography;

const sortOptions = [
  { label: "Newest", value: "newest" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Best Selling", value: "best-selling" },
];

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [sort, setSort] = useState("newest");

  const loadProducts = async (p = 1, s = sort) => {
    setLoading(true);
    try {
      const data = await getProducts(p, 12, s);
      setProducts(data.products);
      setTotal(data.total);
      setPage(data.page);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts(1, sort);
  }, [sort]);

  const handleSortChange = (value) => {
    setSort(value);
  };

  return (
    <div className="products-page">
      <div className="products-header">
        <Title level={2} className="products-title">All Products</Title>
        <Select
          value={sort}
          onChange={handleSortChange}
          options={sortOptions}
          className="products-sort-select"
          style={{ width: 200 }}
          id="products-sort"
        />
      </div>

      {loading ? (
        <div className="products-loading">
          <Spin size="large" />
        </div>
      ) : products.length === 0 ? (
        <Empty description="No products found" />
      ) : (
        <>
          <Row gutter={[24, 24]}>
            {products.map((product) => (
              <Col xs={24} sm={12} md={8} lg={6} key={product._id}>
                <ProductCard product={product} />
              </Col>
            ))}
          </Row>
          {total > 12 && (
            <div className="products-pagination">
              <Pagination
                current={page}
                total={total}
                pageSize={12}
                onChange={(p) => loadProducts(p)}
                showSizeChanger={false}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
