import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Row, Col, Card, Form, Input, Button, Typography, message } from "antd";
import { MailOutlined, LockOutlined, UserOutlined } from "@ant-design/icons";
import { useAuth } from "../../hooks/useAuth";

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleFinish = async (values: {
    name: string;
    email: string;
    password: string;
  }) => {
    setIsLoading(true);
    const result = await register(values.email, values.password, values.name);
    if (!result.success) {
      message.error(result.error || "Ошибка регистрации");
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
            Регистрация
          </Typography.Title>
          <Typography.Paragraph
            type="secondary"
            style={{ textAlign: "center", marginBottom: 24 }}
          >
            Создайте аккаунт администратора
          </Typography.Paragraph>

          <Form layout="vertical" onFinish={handleFinish} requiredMark={false}>
            <Form.Item
              name="name"
              rules={[{ required: true, message: "Введите имя" }]}
            >
              <Input prefix={<UserOutlined />} placeholder="Имя" size="large" />
            </Form.Item>
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
              rules={[
                { required: true, message: "Введите пароль" },
                { min: 6, message: "Минимум 6 символов" },
              ]}
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
                Зарегистрироваться
              </Button>
            </Form.Item>
          </Form>

          <div style={{ textAlign: "center" }}>
            <Typography.Text type="secondary" style={{ fontSize: 13 }}>
              Уже есть аккаунт?{" "}
              <a
                onClick={() => navigate("/admin/login")}
                style={{ cursor: "pointer" }}
              >
                Войти
              </a>
            </Typography.Text>
          </div>
        </Card>
      </Col>
    </Row>
  );
};

export default RegisterPage;
