"use client";

import { useEffect, useState, useCallback, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Row, Col, Spin, Pagination, Empty, Input, Slider, Select, Rate, Button, Typography, Tag } from "antd";
import { SearchOutlined, FilterOutlined, CloseOutlined } from "@ant-design/icons";
import ProductCard from "../../components/ProductCard";
import { searchProducts } from "../../services/product.service";
import { getCategories } from "../../services/category.service";
import { getSubCategories } from "../../services/subcategory.service";
import "../../styles/products.css";

const { Title, Text } = Typography;

const sortOptions = [
  { label: "Newest", value: "newest" },
  { label: "Price: Low → High", value: "price-asc" },
  { label: "Price: High → Low", value: "price-desc" },
  { label: "Best Selling", value: "best-selling" },
  { label: "Most Popular", value: "popular" },
];

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Filter state — initialized from URL search params
  const [keyword, setKeyword] = useState(searchParams.get("keyword") || "");
  const [priceRange, setPriceRange] = useState([
    Number(searchParams.get("priceMin")) || 0,
    Number(searchParams.get("priceMax")) || 10000,
  ]);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "");
  const [selectedSubcategory, setSelectedSubcategory] = useState(searchParams.get("subcategory") || "");
  const [minRating, setMinRating] = useState(Number(searchParams.get("rating")) || 0);
  const [sort, setSort] = useState(searchParams.get("sort") || "newest");
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  const [keywordInput, setKeywordInput] = useState(searchParams.get("keyword") || "");

  // Ref to avoid circular URL sync
  const skipUrlSync = useRef(false);

  // Sync URL search params → state when URL changes externally (e.g. header search)
  useEffect(() => {
    const urlKeyword = searchParams.get("keyword") || "";
    const urlPriceMin = Number(searchParams.get("priceMin")) || 0;
    const urlPriceMax = Number(searchParams.get("priceMax")) || 10000;
    const urlCategory = searchParams.get("category") || "";
    const urlSubcategory = searchParams.get("subcategory") || "";
    const urlRating = Number(searchParams.get("rating")) || 0;
    const urlSort = searchParams.get("sort") || "newest";
    const urlPage = Number(searchParams.get("page")) || 1;

    // Only update state if values actually differ (prevents infinite loops)
    skipUrlSync.current = true;
    setKeyword((prev) => prev !== urlKeyword ? urlKeyword : prev);
    setKeywordInput((prev) => prev !== urlKeyword ? urlKeyword : prev);
    setPriceRange((prev) =>
      prev[0] !== urlPriceMin || prev[1] !== urlPriceMax
        ? [urlPriceMin, urlPriceMax]
        : prev
    );
    setSelectedCategory((prev) => prev !== urlCategory ? urlCategory : prev);
    setSelectedSubcategory((prev) => prev !== urlSubcategory ? urlSubcategory : prev);
    setMinRating((prev) => prev !== urlRating ? urlRating : prev);
    setSort((prev) => prev !== urlSort ? urlSort : prev);
    setPage((prev) => prev !== urlPage ? urlPage : prev);

    // Allow URL sync again after this render
    requestAnimationFrame(() => {
      skipUrlSync.current = false;
    });
  }, [searchParams]);

  // Data state
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Load categories on mount
  useEffect(() => {
    getCategories()
      .then((data) => setCategories(data.categories || []))
      .catch(() => setCategories([]));
  }, []);

  // Load subcategories when category changes
  useEffect(() => {
    if (selectedCategory) {
      // Find the category _id from slug
      const cat = categories.find((c) => c.slug === selectedCategory || c._id === selectedCategory);
      if (cat) {
        getSubCategories(cat._id)
          .then((data) => setSubcategories(data.subcategories || []))
          .catch(() => setSubcategories([]));
      }
    } else {
      setSubcategories([]);
      setSelectedSubcategory("");
    }
  }, [selectedCategory, categories]);

  // Build filters & fetch products
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const filters = {
        page,
        limit: 12,
        sort,
      };
      if (keyword.trim()) filters.keyword = keyword.trim();
      if (priceRange[0] > 0) filters.priceMin = priceRange[0];
      if (priceRange[1] < 10000) filters.priceMax = priceRange[1];
      if (selectedCategory) filters.category = selectedCategory;
      if (selectedSubcategory) filters.subcategory = selectedSubcategory;
      if (minRating > 0) filters.rating = minRating;

      const data = await searchProducts(filters);
      setProducts(data.products || []);
      setTotal(data.total || 0);
    } catch {
      setProducts([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [keyword, priceRange, selectedCategory, selectedSubcategory, minRating, sort, page]);

  // Fetch on filter change
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Sync filters to URL (bookmarkable) — skip when URL just drove the state
  useEffect(() => {
    if (skipUrlSync.current) return;

    const params = new URLSearchParams();
    if (keyword.trim()) params.set("keyword", keyword.trim());
    if (priceRange[0] > 0) params.set("priceMin", priceRange[0]);
    if (priceRange[1] < 10000) params.set("priceMax", priceRange[1]);
    if (selectedCategory) params.set("category", selectedCategory);
    if (selectedSubcategory) params.set("subcategory", selectedSubcategory);
    if (minRating > 0) params.set("rating", minRating);
    if (sort !== "newest") params.set("sort", sort);
    if (page > 1) params.set("page", page);

    const qs = params.toString();
    router.replace(`/products${qs ? `?${qs}` : ""}`, { scroll: false });
  }, [keyword, priceRange, selectedCategory, selectedSubcategory, minRating, sort, page]);

  const clearFilters = () => {
    setKeyword("");
    setKeywordInput("");
    setPriceRange([0, 10000]);
    setSelectedCategory("");
    setSelectedSubcategory("");
    setMinRating(0);
    setSort("newest");
    setPage(1);
  };

  const hasActiveFilters =
    keyword.trim() ||
    priceRange[0] > 0 ||
    priceRange[1] < 10000 ||
    selectedCategory ||
    selectedSubcategory ||
    minRating > 0;

  // Debounce keyword input
  useEffect(() => {
    const t = setTimeout(() => {
      setKeyword(keywordInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [keywordInput]);

  return (
    <div className="products-page">
      {/* Header Bar */}
      <div className="products-header">
        <div className="products-header-left">
          <Title level={2} className="products-title">Products</Title>
          {total > 0 && (
            <Text className="products-count">{total} result{total !== 1 ? "s" : ""}</Text>
          )}
        </div>
        <div className="products-header-right">
          <button
            className={`filter-toggle-btn ${filtersOpen ? "active" : ""}`}
            onClick={() => setFiltersOpen(!filtersOpen)}
            id="toggle-filters"
          >
            <FilterOutlined /> Filters
            {hasActiveFilters && <span className="filter-dot" />}
          </button>
          <Select
            value={sort}
            onChange={(v) => { setSort(v); setPage(1); }}
            options={sortOptions}
            className="products-sort-select"
            style={{ width: 180 }}
            id="products-sort"
          />
        </div>
      </div>

      {/* Active filter tags */}
      {hasActiveFilters && (
        <div className="active-filters-bar">
          {keyword.trim() && (
            <Tag closable onClose={() => { setKeywordInput(""); setKeyword(""); }} className="filter-tag">
              Search: {keyword}
            </Tag>
          )}
          {selectedCategory && (
            <Tag closable onClose={() => setSelectedCategory("")} className="filter-tag">
              Category: {categories.find((c) => c.slug === selectedCategory)?.name || selectedCategory}
            </Tag>
          )}
          {selectedSubcategory && (
            <Tag closable onClose={() => setSelectedSubcategory("")} className="filter-tag">
              Subcategory: {subcategories.find((s) => s.slug === selectedSubcategory)?.name || selectedSubcategory}
            </Tag>
          )}
          {(priceRange[0] > 0 || priceRange[1] < 10000) && (
            <Tag closable onClose={() => setPriceRange([0, 10000])} className="filter-tag">
              ${priceRange[0]} – ${priceRange[1]}
            </Tag>
          )}
          {minRating > 0 && (
            <Tag closable onClose={() => setMinRating(0)} className="filter-tag">
              {minRating}+ Stars
            </Tag>
          )}
          <Button type="link" size="small" onClick={clearFilters} className="clear-all-btn">
            Clear all
          </Button>
        </div>
      )}

      <div className="products-layout">
        {/* Filter Sidebar */}
        <aside className={`filter-sidebar ${filtersOpen ? "open" : ""}`}>
          <div className="filter-sidebar-header">
            <h3>Filters</h3>
            <button className="filter-close-btn" onClick={() => setFiltersOpen(false)}>
              <CloseOutlined />
            </button>
          </div>

          {/* Search */}
          <div className="filter-group">
            <label className="filter-label">Search</label>
            <Input
              placeholder="Search products..."
              prefix={<SearchOutlined />}
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              allowClear
              id="filter-keyword"
            />
          </div>

          {/* Category */}
          <div className="filter-group">
            <label className="filter-label">Category</label>
            <Select
              placeholder="All categories"
              value={selectedCategory || undefined}
              onChange={(v) => { setSelectedCategory(v || ""); setSelectedSubcategory(""); setPage(1); }}
              allowClear
              style={{ width: "100%" }}
              options={categories.map((c) => ({ label: c.name, value: c.slug }))}
              id="filter-category"
            />
          </div>

          {/* Subcategory */}
          {subcategories.length > 0 && (
            <div className="filter-group">
              <label className="filter-label">Subcategory</label>
              <Select
                placeholder="All subcategories"
                value={selectedSubcategory || undefined}
                onChange={(v) => { setSelectedSubcategory(v || ""); setPage(1); }}
                allowClear
                style={{ width: "100%" }}
                options={subcategories.map((s) => ({ label: s.name, value: s.slug }))}
                id="filter-subcategory"
              />
            </div>
          )}

          {/* Price Range */}
          <div className="filter-group">
            <label className="filter-label">
              Price Range
              <span className="filter-label-value">
                ${priceRange[0]} — ${priceRange[1]}
              </span>
            </label>
            <Slider
              range
              min={0}
              max={10000}
              step={50}
              value={priceRange}
              onChange={(v) => setPriceRange(v)}
              onChangeComplete={() => setPage(1)}
              className="filter-slider"
            />
          </div>

          {/* Rating */}
          <div className="filter-group">
            <label className="filter-label">Minimum Rating</label>
            <div className="filter-rating-row">
              <Rate
                value={minRating}
                onChange={(v) => { setMinRating(v); setPage(1); }}
                allowClear
                className="filter-rate"
              />
              {minRating > 0 && (
                <Text className="filter-rating-text">{minRating}+ stars</Text>
              )}
            </div>
          </div>

          {/* Clear All */}
          {hasActiveFilters && (
            <Button block onClick={clearFilters} className="filter-clear-btn" id="clear-filters">
              Clear All Filters
            </Button>
          )}
        </aside>

        {/* Product Grid */}
        <div className="products-grid-area">
          {loading ? (
            <div className="products-loading">
              <Spin size="large" />
            </div>
          ) : products.length === 0 ? (
            <Empty
              description={
                hasActiveFilters
                  ? "No products match your filters"
                  : "No products found"
              }
            />
          ) : (
            <>
              <Row gutter={[20, 20]}>
                {products.map((product) => (
                  <Col xs={24} sm={12} md={8} lg={8} key={product._id}>
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
                    onChange={(p) => setPage(p)}
                    showSizeChanger={false}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="products-loading">
          <Spin size="large" />
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
