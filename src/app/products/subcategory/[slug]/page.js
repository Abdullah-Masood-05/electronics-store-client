"use client";

import { useEffect, useState, use } from "react";
import { Row, Col, Typography, Spin, Pagination, Empty, Breadcrumb } from "antd";
import Link from "next/link";
import ProductCard from "../../../../components/ProductCard";
import { getProductsBySubCategory } from "../../../../services/product.service";
import "../../../../styles/products.css";

const { Title } = Typography;

export default function SubCategoryProductsPage({ params }) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;
  const [products, setProducts] = useState([]);
  const [subcategory, setSubcategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const loadProducts = async (p = 1) => {
    setLoading(true);
    try {
      const data = await getProductsBySubCategory(slug, p);
      setProducts(data.products);
      setTotal(data.total);
      setPage(data.page);
      setSubcategory(data.subcategory);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [slug]);

  return (
    <div className="products-page">
      <Breadcrumb
        className="product-breadcrumb"
        items={[
          { title: <Link href="/products">Products</Link> },
          ...(subcategory?.parent
            ? [
                {
                  title: (
                    <Link href={`/products/category/${subcategory.parent.slug}`}>
                      {subcategory.parent.name}
                    </Link>
                  ),
                },
              ]
            : []),
          { title: subcategory?.name || slug },
        ]}
      />

      <div className="products-header">
        <Title level={2} className="products-title">
          {subcategory?.name || "Sub-category"}
        </Title>
        <span className="products-count">{total} product{total !== 1 ? "s" : ""}</span>
      </div>

      {loading ? (
        <div className="products-loading">
          <Spin size="large" />
        </div>
      ) : products.length === 0 ? (
        <Empty description="No products in this sub-category" />
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
