import React, { useState } from "react";
import { Form, Input, Checkbox, Button, Typography, Card } from "antd";

interface SubmissionFormProps {
  selectedItems: Record<string, { itemId: string; quantity: number }>;
  onSubmit: (userName: string, userSurname: string) => Promise<void>;
  privacyPolicyUrl?: string;
}

const SubmissionForm: React.FC<SubmissionFormProps> = ({
  onSubmit,
  privacyPolicyUrl,
}) => {
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [consent, setConsent] = useState(false);

  const handleFinish = async (values: any) => {
    setIsSubmitting(true);
    await onSubmit(values.userName, values.userSurname);
    setIsSubmitting(false);
  };

  return (
    <Card
      title={<span style={{ fontSize: 18, fontWeight: 600 }}>Ваши данные</span>}
      style={{ borderRadius: 12, marginBottom: 20 }}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        requiredMark={false}
      >
        <Form.Item
          label="Имя"
          name="userName"
          rules={[
            { required: true, message: "Введите имя" },
            { min: 2, message: "Минимум 2 символа" },
            { max: 100, message: "Максимум 100 символов" },
          ]}
        >
          <Input placeholder="Введите имя" />
        </Form.Item>

        <Form.Item
          label="Фамилия"
          name="userSurname"
          rules={[
            { required: true, message: "Введите фамилию" },
            { min: 2, message: "Минимум 2 символа" },
            { max: 100, message: "Максимум 100 символов" },
          ]}
        >
          <Input placeholder="Введите фамилию" />
        </Form.Item>

        <Form.Item style={{ marginBottom: 16 }}>
          <Checkbox
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
          >
            <Typography.Text style={{ fontSize: 14 }}>
              Подтверждаю согласие на{" "}
              <a
                href={privacyPolicyUrl || "#"}
                target={privacyPolicyUrl ? "_blank" : undefined}
                rel={privacyPolicyUrl ? "noopener noreferrer" : undefined}
                style={{ color: "#6366f1", fontWeight: 500 }}
              >
                обработку персональных данных
              </a>
            </Typography.Text>
          </Checkbox>
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            block
            loading={isSubmitting}
            disabled={!consent}
            size="large"
          >
            Отправить
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default SubmissionForm;
