import React from "react";
import { Card, Checkbox, Typography } from "antd";
import { getStatusLabel } from "../../utils/format";

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

const statusColors: Record<string, string> = {
  available: "#22c55e",
  limited: "#eab308",
  full: "#ef4444",
};

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
          const color = statusColors[item.status];

          return (
            <div
              key={item.id}
              style={{
                padding: "10px 12px",
                borderRadius: 8,
                border: `1.5px solid ${selectedItemId === item.id ? "#6366f1" : isFull ? "#ef4444" : "#e2e8f0"}`,
                background: selectedItemId === item.id ? "#eef2ff" : "#fff",
                opacity: isFull ? 0.5 : 1,
              }}
            >
              <Checkbox
                checked={selectedItemId === item.id}
                onChange={() => onSelectItem(section.id, item.id)}
                disabled={isFull}
              >
                <div>
                  <Typography.Text
                    strong
                    style={{ fontSize: 14, color: "#1e293b" }}
                  >
                    {item.label}
                  </Typography.Text>
                  {item.description && (
                    <Typography.Paragraph
                      type="secondary"
                      style={{
                        fontSize: 12,
                        margin: "2px 0 0",
                        lineHeight: 1.3,
                      }}
                    >
                      {item.description}
                    </Typography.Paragraph>
                  )}
                  <div style={{ fontSize: 12, marginTop: 2 }}>
                    <span style={{ color, fontWeight: 600 }}>
                      {getStatusLabel(item.status)}
                    </span>
                    <span style={{ color: "#94a3b8", marginLeft: 8 }}>
                      {item.currentQuantity}/{item.requiredQuantity}{" "}
                      {item.unit || "шт"}
                    </span>
                  </div>
                </div>
              </Checkbox>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default SectionBlock;
