import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Row, Col, Typography, Spin, Button, Tag, Statistic } from "antd";
import { BarChartOutlined, EyeOutlined, EditOutlined } from "@ant-design/icons";
import { submissionsApi } from "../../api/submissions.api";

interface FormSummary {
  _id: string;
  name: string;
  slug: string;
  isPublished: boolean;
  totalSubmissions: number;
}

const StatisticsOverviewPage: React.FC = () => {
  const navigate = useNavigate();
  const [forms, setForms] = useState<FormSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    submissionsApi
      .getFormsSummary()
      .then((data) => setForms(data))
      .catch((err) =>
        setError(err?.response?.data?.error || "Ошибка загрузки статистики"),
      )
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: 60 }}>
        <Spin size="large" tip="Загрузка статистики..." />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: "center", padding: 60 }}>
        <Typography.Title level={4} type="danger">
          {error}
        </Typography.Title>
        <Button type="primary" onClick={() => navigate("/admin")}>
          На главную
        </Button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "100%", overflowX: "hidden" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 24,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <Typography.Title level={4} style={{ margin: 0 }}>
          📊 Статистика по всем формам
        </Typography.Title>
      </div>

      {forms.length === 0 ? (
        <Card style={{ textAlign: "center", padding: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📝</div>
          <Typography.Paragraph>
            У вас пока нет созданных форм
          </Typography.Paragraph>
          <Button type="primary" onClick={() => navigate("/admin/forms")}>
            Создать форму
          </Button>
        </Card>
      ) : (
        <Row gutter={[16, 16]}>
          {forms.map((form) => (
            <Col xs={24} sm={12} lg={8} key={form._id}>
              <Card
                hoverable
                style={{ borderRadius: 12, height: "100%" }}
                actions={[
                  <Button
                    type="link"
                    icon={<BarChartOutlined />}
                    onClick={() =>
                      navigate(`/admin/forms/${form._id}/statistics`)
                    }
                    key="stats"
                  >
                    Статистика
                  </Button>,
                  <Button
                    type="link"
                    icon={<EyeOutlined />}
                    onClick={() => window.open(`/form/${form.slug}`, "_blank")}
                    key="view"
                  >
                    Просмотр
                  </Button>,
                  <Button
                    type="link"
                    icon={<EditOutlined />}
                    onClick={() => navigate(`/admin/forms/${form._id}/edit`)}
                    key="edit"
                  >
                    Редакт.
                  </Button>,
                ]}
              >
                <Card.Meta
                  title={
                    <span style={{ fontSize: 15, fontWeight: 600 }}>
                      {form.name}
                    </span>
                  }
                  description={
                    <div style={{ marginTop: 8 }}>
                      <div style={{ marginBottom: 12 }}>
                        {form.isPublished ? (
                          <Tag color="green">Опубликована</Tag>
                        ) : (
                          <Tag color="default">Черновик</Tag>
                        )}
                      </div>
                      <Statistic
                        title="Всего заявок"
                        value={form.totalSubmissions}
                        prefix={<BarChartOutlined />}
                        valueStyle={{
                          color: "#6366f1",
                          fontSize: 28,
                          fontWeight: 700,
                        }}
                      />
                    </div>
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default StatisticsOverviewPage;
