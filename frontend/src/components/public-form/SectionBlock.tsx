import React from "react";
import { Card, Checkbox, Typography } from "antd";

interface SectionBlockProps {
  section: {
    id: string;
    name: string;
    description?: string;
    order: number;
    items: Array<{
      id: string;
      label: string;
      description?: string;
      type: string;
      requiredQuantity: number;
      currentQuantity: number;
      unit?: string;
      status: "available" | "limited" | "full";
    }>;
  };
  selectedItemId?: string;
  onSelectItem: (sectionId: string, itemId: string) => void;
}

const SectionBlock: React.FC<SectionBlockProps> = ({
  section,
  selectedItemId,
  onSelectItem,
}) => {
  return (
    <Card
      title={
        <span style={{ fontSize: 17, fontWeight: 600 }}>{section.name}</span>
      }
      size="small"
      style={{ marginBottom: 12, borderRadius: 12 }}
    >
      {section.description && (
        <Typography.Paragraph
          type="secondary"
          style={{ fontSize: 13, marginBottom: 12 }}
        >
          {section.description}
        </Typography.Paragraph>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {section.items.map((item) => {
          const isFull = item.status === "full";
          const isSelected = selectedItemId === item.id;

          return (
            <div
              key={item.id}
              onClick={() => !isFull && onSelectItem(section.id, item.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  if (!isFull) onSelectItem(section.id, item.id);
                }
              }}
              style={{
                padding: "10px 12px",
                borderRadius: 8,
                border: `1.5px solid ${isSelected ? "#6366f1" : isFull ? "#ef4444" : "#e2e8f0"}`,
                background: isSelected ? "#eef2ff" : "#fff",
                opacity: isFull ? 0.5 : 1,
                cursor: isFull ? "not-allowed" : "pointer",
                transition: "all 0.15s ease",
                userSelect: "none",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "flex-start", gap: 10 }}
              >
                <Checkbox
                  checked={isSelected}
                  onChange={() => !isFull && onSelectItem(section.id, item.id)}
                  disabled={isFull}
                  onClick={(e) => e.stopPropagation()}
                  style={{ marginTop: 2, flexShrink: 0 }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      gap: 6,
                      flexWrap: "wrap",
                    }}
                  >
                    <Typography.Text
                      strong
                      style={{ fontSize: 14, color: "#1e293b" }}
                    >
                      {item.label}
                    </Typography.Text>
                    {item.description && (
                      <Typography.Text
                        type="secondary"
                        style={{ fontSize: 13 }}
                      >
                        {item.description}
                      </Typography.Text>
                    )}
                  </div>
                  {!isFull && (
                    <div
                      style={{ fontSize: 12, marginTop: 4, color: "#64748b" }}
                    >
                      Нужно ещё{" "}
                      <strong>
                        {item.requiredQuantity - item.currentQuantity}
                      </strong>{" "}
                      {item.unit || "человек"}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default SectionBlock;
