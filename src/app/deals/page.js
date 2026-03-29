"use client";

import { useEffect, useState } from "react";
import { Typography, Spin, Empty } from "antd";
import Link from "next/link";
import AuthGuard from "../../components/AuthGuard";
import { getActiveDeals } from "../../services/deal.service";
import "../../styles/home.css";

const { Title, Text } = Typography;

function DealsContent() {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getActiveDeals()
      .then((data) => setDeals(data.deals || []))
      .catch(() => setDeals([]))
      .finally(() => setLoading(false));
  }, []);

  const getDealLink = (deal) => {
    if (deal.product?.slug) return `/products/${deal.product.slug}`;
    return "#";
  };

  const renderDealImage = (deal) => {
    if (!deal.image) return <span style={{ fontSize: 64 }}>🏷️</span>;
    if (deal.image.startsWith("http")) {
      return <img src={deal.image} alt={deal.title} />;
    }
    return <span style={{ fontSize: 64 }}>{deal.image}</span>;
  };

  return (
    <div style={{ padding: "32px 24px", maxWidth: 1400, margin: "0 auto" }}>
      <Title level={2} style={{ color: "var(--text-primary)", marginBottom: 8 }}>
        Deals & Offers 🔥
      </Title>
      <Text style={{ color: "var(--text-muted)", display: "block", marginBottom: 32 }}>
        All active deals from our stores
      </Text>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 80 }}>
          <Spin size="large" />
        </div>
      ) : deals.length === 0 ? (
        <Empty
          description={
            <Text style={{ color: "var(--text-secondary)" }}>
              No deals available right now. Check back soon!
            </Text>
          }
        />
      ) : (
        <div className="deals-list">
          {deals.map((deal) => (
            <Link
              key={deal._id}
              href={getDealLink(deal)}
              className="featured-deal"
            >
              <div>
                <span className="featured-deal-badge">Featured Deal</span>
                <h3>{deal.title}</h3>
                <p className="featured-deal-price">{deal.price}</p>
                {deal.description && (
                  <p className="featured-deal-desc">{deal.description}</p>
                )}
                {deal.createdBy?.name && (
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    by {deal.createdBy.name}
                  </Text>
                )}
                <br />
                <span className="featured-deal-btn" style={{ marginTop: 12 }}>
                  View Deal
                </span>
              </div>
              <div className="featured-deal-image">
                {renderDealImage(deal)}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function DealsPage() {
  return (
    <AuthGuard>
      <DealsContent />
    </AuthGuard>
  );
}
