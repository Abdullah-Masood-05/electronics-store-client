"use client";

import { useState } from "react";
import { StarFilled, StarOutlined } from "@ant-design/icons";
import { Typography } from "antd";
import "./StarRating.css";

const { Text } = Typography;

/**
 * StarRating component.
 * - readOnly mode: displays average rating + count
 * - interactive mode: allows clicking to submit a rating
 */
const StarRating = ({
  count = 5,
  value = 0,
  onChange,
  readOnly = false,
  totalRatings = 0,
  size = 20,
}) => {
  const [hoverValue, setHoverValue] = useState(0);

  const stars = [];
  for (let i = 1; i <= count; i++) {
    const filled = readOnly ? i <= Math.round(value) : i <= (hoverValue || value);
    stars.push(
      <span
        key={i}
        className={`star-rating-star ${readOnly ? "" : "star-rating-interactive"}`}
        onMouseEnter={() => !readOnly && setHoverValue(i)}
        onMouseLeave={() => !readOnly && setHoverValue(0)}
        onClick={() => !readOnly && onChange?.(i)}
        style={{ fontSize: size, cursor: readOnly ? "default" : "pointer" }}
      >
        {filled ? (
          <StarFilled style={{ color: "#fadb14" }} />
        ) : (
          <StarOutlined style={{ color: readOnly ? "#555" : "#888" }} />
        )}
      </span>
    );
  }

  return (
    <div className="star-rating">
      <div className="star-rating-stars">{stars}</div>
      {readOnly && totalRatings > 0 && (
        <Text className="star-rating-count" type="secondary">
          {value.toFixed(1)} ({totalRatings} {totalRatings === 1 ? "rating" : "ratings"})
        </Text>
      )}
    </div>
  );
};

export default StarRating;
