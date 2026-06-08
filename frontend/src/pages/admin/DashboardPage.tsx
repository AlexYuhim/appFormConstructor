import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Row, Col, Card, Statistic, Button, Typography, Spin } from "antd";
import {
  FormOutlined,
  CheckCircleOutlined,
  EditOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import { useAuthStore } from "../../store/auth.store";
import { useFormBuilder } from "../../hooks/useFormBuilder";

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const admin = useAuthStore((s) => s.admin);
  const { forms, isLoading, loadForms } = useFormBuilder();

  useEffect(() => {
    loadForms();
  }, []);

  const totalForms = forms.length;
  const publishedForms = forms.filter((f) => f.isPublished).length;

  return (
    <div>
      <Typography.Title level={4} style={{ marginBottom: 24 }}>
        Добро пожаловать, {admin?.name}!
      </Typography.Title>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card hoverable>
            <Statistic
              title="Всего форм"
              value={totalForms}
              prefix={<FormOutlined />}
              valueStyle={{ color: "#6366f1" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card hoverable>
            <Statistic
              title="Опубликовано"
              value={publishedForms}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#22c55e" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card hoverable>
            <Statistic
              title="Черновики"
              value={totalForms - publishedForms}
              prefix={<EditOutlined />}
              valueStyle={{ color: "#eab308" }}
            />
          </Card>
        </Col>
      </Row>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <Typography.Title level={5} style={{ margin: 0 }}>
          Последние формы
        </Typography.Title>
        <Button type="primary" onClick={() => navigate("/admin/forms")}>
          Все формы →
        </Button>
      </div>

      {isLoading ? (
        <div style={{ textAlign: "center", padding: 40 }}>
          <Spin size="large" />
        </div>
      ) : forms.length === 0 ? (
        <Card style={{ textAlign: "center", padding: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📝</div>
          <Typography.Paragraph>У вас пока нет форм</Typography.Paragraph>
          <Button type="primary" onClick={() => navigate("/admin/forms")}>
            Создать первую форму
          </Button>
        </Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {forms.slice(0, 5).map((form) => (
            <Card key={form._id} size="small" style={{ borderRadius: 12 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 8,
                }}
              >
                <div
                  style={{ cursor: "pointer", flex: 1, minWidth: 120 }}
                  onClick={() => navigate(`/admin/forms/${form._id}/edit`)}
                >
                  <Typography.Text strong>{form.name}</Typography.Text>
                  <br />
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    {form.isPublished ? "✅ Опубликована" : "📝 Черновик"}
                  </Typography.Text>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    flexWrap: "wrap",
                  }}
                >
                  <Button
                    type="link"
                    size="small"
                    icon={<BarChartOutlined />}
                    onClick={() =>
                      navigate(`/admin/forms/${form._id}/statistics`)
                    }
                    style={{
                      color: "#6366f1",
                      fontWeight: 500,
                      padding: "4px 8px",
                    }}
                  >
                    Статистика
                  </Button>
                  <Typography.Text style={{ color: "#94a3b8", fontSize: 13 }}>
                    |
                  </Typography.Text>
                  <Typography.Text
                    style={{
                      color: "#6366f1",
                      fontSize: 13,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                    onClick={() => navigate(`/admin/forms/${form._id}/edit`)}
                  >
                    Редактировать →
                  </Typography.Text>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
