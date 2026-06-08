import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Row, Col, Card, Form, Input, Button, Typography, message } from "antd";
import { MailOutlined, LockOutlined } from "@ant-design/icons";
import { useAuth } from "../../hooks/useAuth";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleFinish = async (values: { email: string; password: string }) => {
    setIsLoading(true);
    const result = await login(values.email, values.password);
    if (!result.success) {
      message.error(result.error || "Ошибка входа");
    }
    setIsLoading(false);
  };

  return (
    <Row
      justify="center"
      align="middle"
      style={{ minHeight: "100vh", background: "#f8fafc" }}
    >
      <Col xs={22} sm={16} md={12} lg={8} xl={6}>
        <Card style={{ borderRadius: 16 }}>
          <Typography.Title
            level={3}
            style={{ textAlign: "center", marginBottom: 8 }}
          >
            Конструктор форм
          </Typography.Title>
          <Typography.Paragraph
            type="secondary"
            style={{ textAlign: "center", marginBottom: 24 }}
          >
            Войдите в панель управления
          </Typography.Paragraph>

          <Form layout="vertical" onFinish={handleFinish} requiredMark={false}>
            <Form.Item
              name="email"
              rules={[
                { required: true, message: "Введите email" },
                { type: "email", message: "Некорректный email" },
              ]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="Email"
                size="large"
              />
            </Form.Item>
            <Form.Item
              name="password"
              rules={[{ required: true, message: "Введите пароль" }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Пароль"
                size="large"
              />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={isLoading}
                size="large"
              >
                Войти
              </Button>
            </Form.Item>
          </Form>

          <div style={{ textAlign: "center" }}>
            <Typography.Text type="secondary" style={{ fontSize: 13 }}>
              Нет аккаунта?{" "}
              <a
                onClick={() => navigate("/admin/register")}
                style={{ cursor: "pointer" }}
              >
                Зарегистрироваться
              </a>
            </Typography.Text>
          </div>

          <div
            style={{
              marginTop: 16,
              padding: 12,
              background: "#f0fdf4",
              borderRadius: 8,
              fontSize: 12,
              color: "#16a34a",
              lineHeight: 1.5,
            }}
          >
            💡 <strong>Первый вход?</strong> По умолчанию:{" "}
            <code>admin@example.com</code> / <code>admin123</code>
          </div>
        </Card>
      </Col>
    </Row>
  );
};

export default LoginPage;
