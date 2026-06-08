import React from "react";
import ProgressBar from "../ui/ProgressBar";
import ItemStatusBadge from "./ItemStatusBadge";

interface StatisticsTableProps {
  sections: Array<{
    sectionId: string;
    sectionName: string;
    totalItems: number;
    filledItems: number;
    items: Array<{
      itemId: string;
      label: string;
      type: string;
      requiredQuantity: number;
      currentQuantity: number;
      unit?: string;
      progress: number;
      status: "available" | "limited" | "full";
    }>;
  }>;
  totalSubmissions: number;
}

const StatisticsTable: React.FC<StatisticsTableProps> = ({
  sections,
  totalSubmissions,
}) => {
  return (
    <div>
      <div
        style={{
          textAlign: "center",
          padding: "20px",
          backgroundColor: "#eef2ff",
          borderRadius: "12px",
          marginBottom: "24px",
        }}
      >
        <div style={{ fontSize: "36px", fontWeight: 700, color: "#6366f1" }}>
          {totalSubmissions}
        </div>
        <div style={{ fontSize: "14px", color: "#64748b" }}>всего заявок</div>
      </div>

      {sections.map((section) => (
        <div
          key={section.sectionId}
          style={{
            backgroundColor: "#fff",
            borderRadius: "12px",
            padding: "20px",
            marginBottom: "16px",
            border: "1px solid #e2e8f0",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
            }}
          >
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 600 }}>
              {section.sectionName}
            </h3>
            <span style={{ fontSize: "13px", color: "#64748b" }}>
              {section.filledItems}/{section.totalItems} заполнено
            </span>
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                <th
                  style={{
                    textAlign: "left",
                    padding: "8px",
                    fontSize: "12px",
                    color: "#64748b",
                    fontWeight: 500,
                  }}
                >
                  Элемент
                </th>
                <th
                  style={{
                    textAlign: "left",
                    padding: "8px",
                    fontSize: "12px",
                    color: "#64748b",
                    fontWeight: 500,
                  }}
                >
                  Прогресс
                </th>
                <th
                  style={{
                    textAlign: "right",
                    padding: "8px",
                    fontSize: "12px",
                    color: "#64748b",
                    fontWeight: 500,
                  }}
                >
                  Статус
                </th>
              </tr>
            </thead>
            <tbody>
              {section.items.map((item) => (
                <tr
                  key={item.itemId}
                  style={{ borderBottom: "1px solid #f1f5f9" }}
                >
                  <td
                    style={{
                      padding: "12px 8px",
                      fontSize: "14px",
                      fontWeight: 500,
                    }}
                  >
                    {item.label}
                  </td>
                  <td style={{ padding: "12px 8px", minWidth: "150px" }}>
                    <ProgressBar
                      current={item.currentQuantity}
                      required={item.requiredQuantity}
                    />
                  </td>
                  <td style={{ padding: "12px 8px", textAlign: "right" }}>
                    <ItemStatusBadge status={item.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};

export default StatisticsTable;
