import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Button,
  Table,
  Modal,
  Input,
  Tag,
  Space,
  Typography,
  message,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import { useFormBuilder } from "../../hooks/useFormBuilder";
import type { Form } from "../../types/form.types";

const FormListPage: React.FC = () => {
  const navigate = useNavigate();
  const { forms, isLoading, loadForms, createForm, deleteForm } =
    useFormBuilder();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newFormName, setNewFormName] = useState("");
  const [newFormDesc, setNewFormDesc] = useState("");

  useEffect(() => {
    loadForms();
  }, []);

  const handleCreate = async () => {
    if (!newFormName.trim()) return;
    const form = await createForm({
      name: newFormName,
      description: newFormDesc,
    });
    if (form) {
      setShowCreateModal(false);
      setNewFormName("");
      setNewFormDesc("");
      navigate(`/admin/forms/${form._id}/edit`);
    }
  };

  const handleDelete = (form: Form) => {
    Modal.confirm({
      title: `Удалить форму "${form.name}"?`,
      content: "Это действие нельзя отменить",
      okText: "Удалить",
      okType: "danger",
      cancelText: "Отмена",
      onOk: async () => {
        const result = await deleteForm(form._id);
        if (result) message.success("Форма удалена");
      },
    });
  };

  const columns = [
    {
      title: "Название",
      dataIndex: "name",
      key: "name",
      render: (name: string, record: Form) => (
        <a onClick={() => navigate(`/admin/forms/${record._id}/edit`)}>
          {name}
        </a>
      ),
    },
    {
      title: "Slug",
      dataIndex: "slug",
      key: "slug",
      render: (slug: string) => (
        <Typography.Text copyable>{slug}</Typography.Text>
      ),
      responsive: ["md" as const],
    },
    {
      title: "Статус",
      dataIndex: "isPublished",
      key: "isPublished",
      render: (isPublished: boolean) =>
        isPublished ? (
          <Tag color="green">Опубликована</Tag>
        ) : (
          <Tag color="default">Черновик</Tag>
        ),
    },
    {
      title: "Действия",
      key: "actions",
      render: (_: any, record: Form) => (
        <Space size="small" onClick={(e) => e.stopPropagation()}>
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => navigate(`/admin/forms/${record._id}/edit`)}
          />
          <Button
            type="text"
            size="small"
            icon={<BarChartOutlined />}
            onClick={() => navigate(`/admin/forms/${record._id}/statistics`)}
          />
          <Button
            type="text"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          />
        </Space>
      ),
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
          Мои формы
        </Typography.Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setShowCreateModal(true)}
        >
          Создать форму
        </Button>
      </div>

      <Card style={{ borderRadius: 12 }}>
        <Table
          dataSource={forms}
          columns={columns}
          loading={isLoading}
          rowKey="_id"
          pagination={false}
          onRow={(record) => ({
            style: { cursor: "pointer" },
            onClick: () => navigate(`/admin/forms/${record._id}/edit`),
          })}
          locale={{ emptyText: "Нет созданных форм" }}
        />
      </Card>

      <Modal
        title="Новая форма"
        open={showCreateModal}
        onCancel={() => setShowCreateModal(false)}
        onOk={handleCreate}
        okText="Создать"
      >
        <div style={{ marginTop: 16 }}>
          <Input
            placeholder="Название формы"
            value={newFormName}
            onChange={(e) => setNewFormName(e.target.value)}
            style={{ marginBottom: 12 }}
          />
          <Input
            placeholder="Описание (опционально)"
            value={newFormDesc}
            onChange={(e) => setNewFormDesc(e.target.value)}
          />
        </div>
      </Modal>
    </div>
  );
};

export default FormListPage;
