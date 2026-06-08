import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Table,
  Tabs,
  Tag,
  Progress,
  Button,
  Typography,
  Statistic,
  Row,
  Col,
  Spin,
} from "antd";
import { ArrowLeftOutlined, DownloadOutlined } from "@ant-design/icons";
import { submissionsApi } from "../../api/submissions.api";
import { getStatusLabel, getTypeLabel } from "../../utils/format";
import type {
  StatisticsResponse,
  PaginatedSubmissions,
} from "../../types/submission.types";

const FormStatisticsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [stats, setStats] = useState<StatisticsResponse | null>(null);
  const [submissions, setSubmissions] = useState<PaginatedSubmissions | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);

    Promise.all([
      submissionsApi.getStatistics(id),
      submissionsApi.getSubmissions(id, page),
    ])
      .then(([statsData, subsData]) => {
        setStats(statsData);
        setSubmissions(subsData);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [id, page]);

  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: 60 }}>
        <Spin size="large" tip="Загрузка статистики..." />
      </div>
    );
  }

  if (!stats) return null;

  const itemColumns = [
    {
      title: "Элемент",
      dataIndex: "label",
      key: "label",
    },
    {
      title: "Тип",
      dataIndex: "type",
      key: "type",
      render: (type: string) => getTypeLabel(type as any),
      responsive: ["md" as const],
    },
    {
      title: "Прогресс",
      key: "progress",
      render: (_: any, record: any) => (
        <Progress
          percent={record.progress}
          size="small"
          strokeColor={
            record.status === "full"
              ? "#ef4444"
              : record.status === "limited"
                ? "#eab308"
                : "#22c55e"
          }
          format={() => `${record.currentQuantity}/${record.requiredQuantity}`}
        />
      ),
    },
    {
      title: "Статус",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const color =
          status === "full" ? "red" : status === "limited" ? "gold" : "green";
        return <Tag color={color}>{getStatusLabel(status as any)}</Tag>;
      },
    },
  ];

  const submissionColumns = [
    {
      title: "Участник",
      key: "name",
      render: (_: any, record: any) =>
        `${record.userName} ${record.userSurname}`,
    },
    {
      title: "Выбрано",
      key: "items",
      render: (_: any, record: any) => (
        <span>
          {record.selectedItems.map((i: any, idx: number) => (
            <Tag key={idx} color="geekblue" style={{ marginBottom: 2 }}>
              {i.label}
              {i.quantity > 1 ? ` x${i.quantity}` : ""}
            </Tag>
          ))}
        </span>
      ),
    },
    {
      title: "Дата",
      dataIndex: "submittedAt",
      key: "submittedAt",
      render: (date: string) => new Date(date).toLocaleString("ru-RU"),
      width: 160,
    },
  ];

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <Typography.Title level={4} style={{ margin: 0 }}>
          Статистика
        </Typography.Title>
        <div style={{ display: "flex", gap: 8 }}>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/admin/forms")}
          >
            Назад
          </Button>
          <Button
            icon={<DownloadOutlined />}
            onClick={() =>
              window.open(
                `${import.meta.env.VITE_API_URL}/admin/forms/${id}/statistics/export?format=csv`,
                "_blank",
              )
            }
          >
            CSV
          </Button>
        </div>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Всего заявок"
              value={stats.totalSubmissions}
              valueStyle={{ color: "#6366f1" }}
            />
          </Card>
        </Col>
      </Row>

      <Tabs
        items={[
          {
            key: "stats",
            label: `📊 Прогресс (${stats.sections.length} разделов)`,
            children: (
              <div>
                {stats.sections.map((section) => (
                  <Card
                    key={section.sectionId}
                    title={section.sectionName}
                    size="small"
                    style={{ marginBottom: 16 }}
                    extra={
                      <Typography.Text
                        type="secondary"
                        style={{ fontSize: 12 }}
                      >
                        {section.filledItems}/{section.totalItems} заполнено
                      </Typography.Text>
                    }
                  >
                    <Table
                      dataSource={section.items}
                      columns={itemColumns}
                      rowKey="itemId"
                      pagination={false}
                      size="small"
                    />
                  </Card>
                ))}
              </div>
            ),
          },
          {
            key: "submissions",
            label: `📋 Заявки (${submissions?.pagination?.total || 0})`,
            children: (
              <Card style={{ borderRadius: 12 }}>
                <Table
                  dataSource={submissions?.submissions || []}
                  columns={submissionColumns}
                  rowKey="id"
                  pagination={
                    submissions?.pagination
                      ? {
                          current: page,
                          pageSize: submissions.pagination.limit,
                          total: submissions.pagination.total,
                          onChange: setPage,
                          showSizeChanger: false,
                        }
                      : false
                  }
                  locale={{ emptyText: "Пока нет заявок" }}
                />
              </Card>
            ),
          },
        ]}
      />
    </div>
  );
};

export default FormStatisticsPage;
