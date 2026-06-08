import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Row, Col, Card, Statistic, Button, Typography, Spin } from "antd";
import {
  FormOutlined,
  CheckCircleOutlined,
  EditOutlined,
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
          <Button type="primary" onClick={() => navigate("/admin/forms/new")}>
            Создать первую форму
          </Button>
        </Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {forms.slice(0, 5).map((form) => (
            <Card
              key={form._id}
              hoverable
              size="small"
              onClick={() => navigate(`/admin/forms/${form._id}/edit`)}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <Typography.Text strong>{form.name}</Typography.Text>
                  <br />
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    {form.isPublished ? "✅ Опубликована" : "📝 Черновик"}
                  </Typography.Text>
                </div>
                <Typography.Text style={{ color: "#6366f1", fontSize: 13 }}>
                  Редактировать →
                </Typography.Text>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
