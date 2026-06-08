import React, { useState, useEffect } from "react";
import { Modal, Input, Form, InputNumber } from "antd";
import type { CreateItemDto, UpdateItemDto } from "../../types/form.types";

interface ItemEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateItemDto | UpdateItemDto) => Promise<void>;
  initialData?: {
    label: string;
    description?: string;
    requiredQuantity: number;
    unit?: string;
  };
  title: string;
}

const ItemEditModal: React.FC<ItemEditModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  title,
}) => {
  const [form] = Form.useForm();
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      form.resetFields();
      if (initialData) {
        form.setFieldsValue(initialData);
      }
    }
  }, [isOpen, initialData, form]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setIsSaving(true);
      await onSave({
        label: values.label,
        description: values.description || undefined,
        requiredQuantity: values.requiredQuantity,
        unit: values.unit || undefined,
      });
      setIsSaving(false);
      onClose();
    } catch {
      // validation failed
    }
  };

  return (
    <Modal
      title={title}
      open={isOpen}
      onCancel={onClose}
      onOk={handleSave}
      confirmLoading={isSaving}
      okText={initialData ? "Сохранить изменения" : "Создать элемент"}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item
          label="Название"
          name="label"
          rules={[{ required: true, message: "Введите название" }]}
        >
          <Input placeholder="Например: Пирог с капустой" />
        </Form.Item>
        <Form.Item label="Описание" name="description">
          <Input placeholder="Дополнительная информация" />
        </Form.Item>
        <Form.Item
          label="Требуемое количество"
          name="requiredQuantity"
          rules={[{ required: true, message: "Введите количество" }]}
          initialValue={1}
        >
          <InputNumber
            min={1}
            style={{ width: "100%" }}
            addonAfter={
              <span
                style={{ cursor: "pointer" }}
                onClick={() => {
                  const val = form.getFieldValue("requiredQuantity") || 1;
                  form.setFieldsValue({ requiredQuantity: val + 1 });
                }}
              >
                +
              </span>
            }
            addonBefore={
              <span
                style={{ cursor: "pointer" }}
                onClick={() => {
                  const val = form.getFieldValue("requiredQuantity") || 1;
                  form.setFieldsValue({
                    requiredQuantity: Math.max(1, val - 1),
                  });
                }}
              >
                −
              </span>
            }
          />
        </Form.Item>
        <Form.Item label="Единица измерения (опционально)" name="unit">
          <Input placeholder="кг, шт, порций..." />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ItemEditModal;
