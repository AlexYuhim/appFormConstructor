import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Button, Input, Typography, message, Spin, Modal } from "antd";
import {
  ArrowLeftOutlined,
  SaveOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useFormBuilder } from "../../hooks/useFormBuilder";
import SectionEditor from "./SectionEditor";
import ItemEditModal from "./ItemEditModal";
import type { CreateItemDto } from "../../types/form.types";

const FormEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    currentForm,
    isLoading,
    error,
    loadForm,
    updateForm,
    togglePublish,
    addSection,
    addItem,
    clearError,
  } = useFormBuilder();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [privacyPolicy, setPrivacyPolicy] = useState("");
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [sectionName, setSectionName] = useState("");
  const [showItemModal, setShowItemModal] = useState<string | null>(null);

  useEffect(() => {
    if (id) loadForm(id);
  }, [id]);

  useEffect(() => {
    if (currentForm) {
      setName(currentForm.name);
      setDescription(currentForm.description || "");
      setPrivacyPolicy(currentForm.privacyPolicy || "");
    }
  }, [currentForm]);

  // Show error as antd message
  useEffect(() => {
    if (error) {
      message.error(error);
      clearError();
    }
  }, [error]);

  if (isLoading && !currentForm)
    return (
      <div style={{ textAlign: "center", padding: 60 }}>
        <Spin size="large" tip="Загрузка формы..." />
      </div>
    );
  if (!currentForm) return <div>Форма не найдена</div>;

  const handleSave = async () => {
    if (!id) return;
    const result = await updateForm(id, { name, description, privacyPolicy });
    if (result) message.success("Форма сохранена");
  };

  const handlePublish = async () => {
    if (!id) return;
    const result = await togglePublish(id, currentForm.isPublished);
    if (result) {
      message.success(
        currentForm.isPublished
          ? "Форма снята с публикации"
          : "Форма опубликована!",
      );
    }
  };

  const handleAddSection = async () => {
    if (!id || !sectionName.trim()) return;
    const result = await addSection(id, { name: sectionName });
    if (result) {
      setSectionName("");
      setShowSectionModal(false);
      message.success("Раздел добавлен");
    }
  };

  const handleAddItem = async (data: CreateItemDto | any) => {
    if (!id || !showItemModal) return;
    const result = await addItem(id, showItemModal, data as CreateItemDto);
    if (result) {
      setShowItemModal(null);
      message.success("Элемент добавлен");
    }
  };

  const getPublicUrl = () => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/form/${currentForm.slug}`;
    }
    return `/form/${currentForm.slug}`;
  };

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
          Редактор формы
        </Typography.Title>
        <div style={{ display: "flex", gap: 8 }}>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/admin/forms")}
          >
            Назад
          </Button>
          <Button
            type={currentForm.isPublished ? "default" : "primary"}
            onClick={handlePublish}
          >
            {currentForm.isPublished ? "Снять с публикации" : "Опубликовать"}
          </Button>
          <Button type="primary" icon={<SaveOutlined />} onClick={handleSave}>
            Сохранить
          </Button>
        </div>
      </div>

      <Card style={{ borderRadius: 12, marginBottom: 24 }}>
        <div style={{ marginBottom: 16 }}>
          <Typography.Text strong style={{ display: "block", marginBottom: 6 }}>
            Название формы
          </Typography.Text>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Например: Пир любви 2026"
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <Typography.Text strong style={{ display: "block", marginBottom: 6 }}>
            Описание
          </Typography.Text>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Краткое описание цели формы"
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <Typography.Text strong style={{ display: "block", marginBottom: 6 }}>
            Ссылка на политику конфиденциальности
          </Typography.Text>
          <Input
            value={privacyPolicy}
            onChange={(e) => setPrivacyPolicy(e.target.value)}
            placeholder="https://example.com/privacy.pdf"
          />
        </div>
        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
          Slug: {currentForm.slug}
        </Typography.Text>

        {currentForm.isPublished && (
          <div
            style={{
              marginTop: 12,
              padding: "10px 12px",
              background: "#f0fdf4",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span>🔗</span>
            <Typography.Text style={{ color: "#16a34a", fontSize: 12 }}>
              Опубликована:
            </Typography.Text>
            <a
              href={getPublicUrl()}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#6366f1", fontSize: 12, wordBreak: "break-all" }}
            >
              {getPublicUrl()}
            </a>
          </div>
        )}
      </Card>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <Typography.Title level={5} style={{ margin: 0 }}>
          Разделы
        </Typography.Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setShowSectionModal(true)}
        >
          Добавить раздел
        </Button>
      </div>

      {currentForm.sections?.map((section: any) => (
        <SectionEditor
          key={section._id}
          section={section}
          formId={id!}
          onAddItem={() => setShowItemModal(section._id)}
        />
      ))}

      {(!currentForm.sections || currentForm.sections.length === 0) && (
        <Card style={{ textAlign: "center", padding: 40, borderRadius: 12 }}>
          <Typography.Text type="secondary">
            Нет разделов. Добавьте первый раздел.
          </Typography.Text>
        </Card>
      )}

      <Modal
        title="Новый раздел"
        open={showSectionModal}
        onCancel={() => setShowSectionModal(false)}
        onOk={handleAddSection}
        okText="Создать"
      >
        <div style={{ marginTop: 16 }}>
          <Input
            placeholder="Название раздела"
            value={sectionName}
            onChange={(e) => setSectionName(e.target.value)}
          />
        </div>
      </Modal>

      <ItemEditModal
        isOpen={!!showItemModal}
        onClose={() => setShowItemModal(null)}
        onSave={handleAddItem}
        title="Новый элемент"
      />
    </div>
  );
};

export default FormEditor;
