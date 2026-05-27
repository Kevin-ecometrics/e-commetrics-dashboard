"use client";

import { Bell } from "lucide-react";
import { useState } from "react";

export default function NotificationBell() {
  const [count] = useState(3);

  return (
    <button
      style={{
        width: 34,
        height: 34,
        borderRadius: 8,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        border: "1px solid var(--ec-hairline)",
        background: "transparent",
        color: "var(--ec-text-muted)",
        cursor: "pointer",
        transition: "all 150ms",
        position: "relative",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "rgba(189,21,92,0.06)";
        e.currentTarget.style.borderColor = "var(--ec-brand)";
        e.currentTarget.style.color = "var(--ec-brand)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
        e.currentTarget.style.borderColor = "var(--ec-hairline)";
        e.currentTarget.style.color = "var(--ec-text-muted)";
      }}
    >
      <Bell size={15} />
      {count > 0 && (
        <span
          style={{
            position: "absolute",
            top: 4,
            right: 4,
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: "var(--ec-brand)",
          }}
        />
      )}
    </button>
  );
}
