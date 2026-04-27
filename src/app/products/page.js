"use client";

import { useEffect, useState, useCallback, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Spin, Pagination, Empty, Input, Slider, Select, Rate, Button, Tag, Typography } from "antd";
import { FilterOutlined, CloseOutlined } from "@ant-design/icons";
import ProductCard from "../../components/ProductCard";
import AuthGuard from "../../components/AuthGuard";
import { searchProducts } from "../../services/product.service";
import { getCategories } from "../../services/category.service";
import { getSubCategories } from "../../services/subcategory.service";
import "../../styles/products.css";

const { Text } = Typography;

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

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

  const skipUrlSync = useRef(false);

  // Sync URL → state
  useEffect(() => {
    skipUrlSync.current = true;
    const urlKw = searchParams.get("keyword") || "";
    setKeyword((p) => (p !== urlKw ? urlKw : p));
    setKeywordInput((p) => (p !== urlKw ? urlKw : p));
    const pm = Number(searchParams.get("priceMin")) || 0;
    const px = Number(searchParams.get("priceMax")) || 10000;
    setPriceRange((p) => (p[0] !== pm || p[1] !== px ? [pm, px] : p));
    const c = searchParams.get("category") || "";
    setSelectedCategory((p) => (p !== c ? c : p));
    const sc = searchParams.get("subcategory") || "";
    setSelectedSubcategory((p) => (p !== sc ? sc : p));
    const r = Number(searchParams.get("rating")) || 0;
    setMinRating((p) => (p !== r ? r : p));
    const s = searchParams.get("sort") || "newest";
    setSort((p) => (p !== s ? s : p));
    const pg = Number(searchParams.get("page")) || 1;
    setPage((p) => (p !== pg ? pg : p));
    requestAnimationFrame(() => { skipUrlSync.current = false; });
  }, [searchParams]);

  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    getCategories().then((d) => setCategories(d.categories || [])).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      const cat = categories.find((c) => c.slug === selectedCategory || c._id === selectedCategory);
      if (cat) {
        getSubCategories(cat._id).then((d) => setSubcategories(d.subcategories || [])).catch(() => setSubcategories([]));
      }
    } else {
      setSubcategories([]);
      setSelectedSubcategory("");
    }
  }, [selectedCategory, categories]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const filters = { page, limit: 12, sort };
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

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  useEffect(() => {
    if (skipUrlSync.current) return;
    const p = new URLSearchParams();
    if (keyword.trim()) p.set("keyword", keyword.trim());
    if (priceRange[0] > 0) p.set("priceMin", priceRange[0]);
    if (priceRange[1] < 10000) p.set("priceMax", priceRange[1]);
    if (selectedCategory) p.set("category", selectedCategory);
    if (selectedSubcategory) p.set("subcategory", selectedSubcategory);
    if (minRating > 0) p.set("rating", minRating);
    if (sort !== "newest") p.set("sort", sort);
    if (page > 1) p.set("page", page);
    const qs = p.toString();
    router.replace(`/products${qs ? `?${qs}` : ""}`, { scroll: false });
  }, [keyword, priceRange, selectedCategory, selectedSubcategory, minRating, sort, page]);

  const clearFilters = () => {
    setKeyword(""); setKeywordInput(""); setPriceRange([0, 10000]);
    setSelectedCategory(""); setSelectedSubcategory("");
    setMinRating(0); setSort("newest"); setPage(1);
  };

  const hasActiveFilters = keyword.trim() || priceRange[0] > 0 || priceRange[1] < 10000 || selectedCategory || selectedSubcategory || minRating > 0;

  useEffect(() => {
    const t = setTimeout(() => { setKeyword(keywordInput); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [keywordInput]);

  return (
    <div className="products-page">
      {/* Header */}
      <div className="products-header">
        <div className="products-header-left">
          <h1 className="products-title">Products</h1>
          <span className="products-count">{total} results</span>
        </div>
        <div className="products-header-right">
          <button className={`filter-toggle-btn ${filtersOpen ? "active" : ""}`} onClick={() => setFiltersOpen(!filtersOpen)}>
            <FilterOutlined />
            Filters
            {hasActiveFilters && <span className="filter-dot" />}
          </button>
          <Select
            value={sort}
            onChange={(v) => { setSort(v); setPage(1); }}
            style={{ width: 160 }}
            size="small"
            options={[
              { label: "Newest", value: "newest" },
              { label: "Price: Low → High", value: "price-asc" },
              { label: "Price: High → Low", value: "price-desc" },
              { label: "Most Popular", value: "popular" },
            ]}
            id="sort-select"
          />
        </div>
      </div>

      {/* Active Filter Tags */}
      {hasActiveFilters && (
        <div className="active-filters-bar">
          {keyword.trim() && (
            <Tag closable onClose={() => { setKeyword(""); setKeywordInput(""); }} className="filter-tag">"{keyword}"</Tag>
          )}
          {selectedCategory && (
            <Tag closable onClose={() => setSelectedCategory("")} className="filter-tag">{selectedCategory}</Tag>
          )}
          {selectedSubcategory && (
            <Tag closable onClose={() => setSelectedSubcategory("")} className="filter-tag">{selectedSubcategory}</Tag>
          )}
          {(priceRange[0] > 0 || priceRange[1] < 10000) && (
            <Tag closable onClose={() => setPriceRange([0, 10000])} className="filter-tag">${priceRange[0]}–${priceRange[1]}</Tag>
          )}
          {minRating > 0 && (
            <Tag closable onClose={() => setMinRating(0)} className="filter-tag">{minRating}+ stars</Tag>
          )}
          <Button type="link" size="small" onClick={clearFilters} className="clear-all-btn">Clear All</Button>
        </div>
      )}

      {/* Layout */}
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
            <div className="filter-label">Search</div>
            <Input
              placeholder="Search products..."
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              allowClear
              size="small"
              id="filter-search"
            />
          </div>

          {/* Category */}
          <div className="filter-group">
            <div className="filter-label">Category</div>
            <Select
              value={selectedCategory || undefined}
              onChange={(v) => { setSelectedCategory(v || ""); setSelectedSubcategory(""); setPage(1); }}
              allowClear
              placeholder="All categories"
              style={{ width: "100%" }}
              size="small"
              options={categories.map((c) => ({ label: c.name, value: c.slug }))}
              id="filter-category"
            />
          </div>

          {/* Subcategory */}
          {subcategories.length > 0 && (
            <div className="filter-group">
              <div className="filter-label">Subcategory</div>
              <Select
                value={selectedSubcategory || undefined}
                onChange={(v) => { setSelectedSubcategory(v || ""); setPage(1); }}
                allowClear
                placeholder="All"
                style={{ width: "100%" }}
                size="small"
                options={subcategories.map((s) => ({ label: s.name, value: s.slug }))}
                id="filter-subcategory"
              />
            </div>
          )}

          {/* Price */}
          <div className="filter-group">
            <div className="filter-label">
              <span>Price</span>
              <span className="filter-label-value">${priceRange[0]} – ${priceRange[1]}</span>
            </div>
            <Slider
              range
              min={0}
              max={10000}
              step={50}
              value={priceRange}
              onChange={(v) => { setPriceRange(v); setPage(1); }}
              className="filter-slider"
            />
          </div>

          {/* Rating */}
          <div className="filter-group">
            <div className="filter-label">Rating</div>
            <div className="filter-rating-row">
              <Rate value={minRating} onChange={(v) => { setMinRating(v); setPage(1); }} />
              <Text className="filter-rating-text">{minRating > 0 ? `${minRating}+` : "Any"}</Text>
            </div>
          </div>

          <Button block onClick={clearFilters} className="filter-clear-btn">
            Reset Filters
          </Button>
        </aside>

        {/* Products */}
        <div className="products-grid-area">
          {loading ? (
            <div className="products-loading"><Spin size="large" /></div>
          ) : products.length === 0 ? (
            <Empty description={<Text style={{ color: "var(--text-muted)" }}>No products found</Text>} />
          ) : (
            <>
              <div className="product-grid">
                {products.map((p) => <ProductCard key={p._id} product={p} />)}
              </div>
              {total > 12 && (
                <div className="products-pagination">
                  <Pagination
                    current={page}
                    total={total}
                    pageSize={12}
                    onChange={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }}
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
    <AuthGuard>
      <Suspense fallback={<div className="products-loading"><Spin size="large" /></div>}>
        <ProductsContent />
      </Suspense>
    </AuthGuard>
  );
}
