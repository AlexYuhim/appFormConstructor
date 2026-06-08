import React, { useState } from "react";
import { Card, Button, Typography, Space, Input } from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { formsApi } from "../../api/forms.api";
import { useFormBuilder } from "../../hooks/useFormBuilder";
import ItemEditModal from "./ItemEditModal";
import type { UpdateItemDto } from "../../types/form.types";

interface SectionEditorProps {
  section: any;
  formId: string;
  onAddItem: () => void;
}

const SectionEditor: React.FC<SectionEditorProps> = ({
  section,
  formId,
  onAddItem,
}) => {
  const { loadForm } = useFormBuilder();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(section.name);
  const [editingItem, setEditingItem] = useState<any | null>(null);

  const handleSaveSection = async () => {
    await formsApi.updateSection(formId, section._id, { name });
    setIsEditing(false);
    await loadForm(formId);
  };

  const handleDeleteSection = async () => {
    if (!window.confirm("Удалить раздел?")) return;
    await formsApi.deleteSection(formId, section._id);
    await loadForm(formId);
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!window.confirm("Удалить элемент?")) return;
    await formsApi.deleteItem(formId, section._id, itemId);
    await loadForm(formId);
  };

  const handleEditItem = async (data: UpdateItemDto) => {
    if (!editingItem) return;
    await formsApi.updateItem(formId, section._id, editingItem._id, data);
    setEditingItem(null);
    await loadForm(formId);
  };

  return (
    <Card
      style={{ borderRadius: 12, marginBottom: 16 }}
      size="small"
      title={
        isEditing ? (
          <Space.Compact style={{ width: "100%" }}>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ flex: 1 }}
            />
            <Button type="primary" onClick={handleSaveSection}>
              Сохранить
            </Button>
            <Button onClick={() => setIsEditing(false)}>Отмена</Button>
          </Space.Compact>
        ) : (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: 16, fontWeight: 600 }}>
              {section.name}
            </span>
            <Space size="small">
              <Button
                type="text"
                size="small"
                icon={<EditOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(true);
                }}
              />
              <Button
                type="text"
                size="small"
                danger
                icon={<DeleteOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteSection();
                }}
              />
            </Space>
          </div>
        )
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {section.items?.map((item: any) => (
          <div
            key={item._id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "10px 12px",
              background: "#f8fafc",
              borderRadius: 8,
            }}
          >
            <div>
              <Typography.Text strong style={{ fontSize: 14 }}>
                {item.label}
              </Typography.Text>
              <br />
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                Требуется: {item.requiredQuantity} {item.unit || "шт"} ·
                Заполнено: {item.currentQuantity}
              </Typography.Text>
            </div>
            <Space size="small">
              <Button
                type="text"
                size="small"
                icon={<EditOutlined />}
                onClick={() => setEditingItem(item)}
              />
              <Button
                type="text"
                size="small"
                danger
                icon={<DeleteOutlined />}
                onClick={() => handleDeleteItem(item._id)}
              />
            </Space>
          </div>
        ))}
      </div>

      <Button
        type="dashed"
        icon={<PlusOutlined />}
        onClick={onAddItem}
        block
        style={{ marginTop: 12 }}
      >
        Добавить элемент
      </Button>

      <ItemEditModal
        isOpen={!!editingItem}
        onClose={() => setEditingItem(null)}
        onSave={handleEditItem}
        title="Редактировать элемент"
        initialData={
          editingItem
            ? {
                label: editingItem.label,
                description: editingItem.description,
                requiredQuantity: editingItem.requiredQuantity,
                unit: editingItem.unit,
              }
            : undefined
        }
      />
    </Card>
  );
};

export default SectionEditor;
