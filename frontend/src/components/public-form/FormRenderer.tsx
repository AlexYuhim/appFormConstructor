import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Row, Col, Spin, Button } from "antd";
import { useFormSubmission } from "../../hooks/useFormSubmission";
import { useSocket } from "../../hooks/useSocket";
import SectionBlock from "./SectionBlock";
import SubmissionForm from "./SubmissionForm";
import type { SubmitFormDto } from "../../types/submission.types";
import type { ItemStatusChanged } from "../../types/submission.types";

const FormRenderer: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const {
    currentForm,
    isLoading,
    error,
    submitted,
    loadForm,
    submitForm,
    reset,
  } = useFormSubmission();
  const [selectedItems, setSelectedItems] = useState<
    Record<string, { itemId: string; quantity: number }>
  >({});
  const [customText, setCustomText] = useState("");

  const formId = currentForm?.form?.id;
  const { onItemStatusChanged } = useSocket(formId);

  useEffect(() => {
    if (slug) loadForm(slug);
  }, [slug]);

  useEffect(() => {
    if (currentForm?.form?.name) {
      document.title = `${currentForm.form.name} — Конструктор форм`;
    }
    return () => {
      document.title = "Конструктор форм";
    };
  }, [currentForm]);

  useEffect(() => {
    const cleanup = onItemStatusChanged?.((data: ItemStatusChanged) => {
      if (currentForm) {
        const updatedForm = { ...currentForm };
        for (const section of updatedForm.form.sections) {
          for (const item of section.items) {
            if (item.id === data.itemId) {
              item.currentQuantity = data.currentQuantity;
              item.status = data.status;
            }
          }
        }
      }
    });
    return cleanup;
  }, [formId, currentForm]);

  const handleSelectItem = useCallback((sectionId: string, itemId: string) => {
    setSelectedItems((prev) => {
      if (prev[sectionId]?.itemId === itemId) {
        const next = { ...prev };
        delete next[sectionId];
        return next;
      }
      return {
        ...prev,
        [sectionId]: { itemId, quantity: 1 },
      };
    });
  }, []);

  const handleSubmit = async (userName: string, userSurname: string) => {
    if (!slug) return;

    const dto: SubmitFormDto = {
      userName,
      userSurname,
      consentGiven: true,
      selectedItems: Object.entries(selectedItems).map(([sectionId, data]) => ({
        itemId: data.itemId,
        sectionId,
        quantity: data.quantity,
      })),
      ...(customText.trim() ? { customText: customText.trim() } : {}),
    };

    await submitForm(slug, dto);
  };

  if (isLoading)
    return (
      <div style={{ textAlign: "center", padding: 60 }}>
        <Spin size="large" tip="Загрузка формы..." />
      </div>
    );

  if (error) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "60px 20px",
          color: "#ef4444",
        }}
      >
        <h2>Форма не найдена</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "60px 20px",
          maxWidth: 500,
          margin: "0 auto",
        }}
      >
        <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
        <h2 style={{ marginBottom: 12 }}>Спасибо за участие!</h2>
        <p style={{ color: "#64748b", marginBottom: 24 }}>
          Ваша заявка успешно отправлена.
        </p>
        <Button
          type="primary"
          size="large"
          onClick={() => {
            setSelectedItems({});
            setCustomText("");
            reset();
            if (slug) loadForm(slug);
          }}
        >
          Заполнить ещё раз
        </Button>
      </div>
    );
  }

  if (!currentForm) return null;

  const privacyPolicyUrl = currentForm.form.privacyPolicy || "";

  return (
    <Row justify="center" style={{ padding: "20px 12px" }}>
      <Col xs={24} sm={22} md={20} lg={16} xl={14}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <h1
            style={{
              fontSize: 24,
              margin: "0 0 8px",
              color: "#1e293b",
            }}
          >
            {currentForm.form.name}
          </h1>
          {currentForm.form.description && (
            <p
              style={{
                color: "#64748b",
                fontSize: 14,
                lineHeight: 1.5,
              }}
            >
              {currentForm.form.description}
            </p>
          )}
        </div>

        {currentForm.form.sections.map((section) => (
          <SectionBlock
            key={section.id}
            section={section}
            selectedItemId={selectedItems[section.id]?.itemId}
            onSelectItem={handleSelectItem}
          />
        ))}

        {/* Custom text section */}
        <div
          style={{
            backgroundColor: "#fff",
            borderRadius: 12,
            padding: 20,
            marginBottom: 20,
            border: "1px solid #e2e8f0",
          }}
        >
          <p
            style={{
              margin: "0 0 12px",
              fontSize: 14,
              color: "#334155",
              fontWeight: 500,
            }}
          >
            Если хотите принести что-то не из списка — напишите здесь:
          </p>
          <textarea
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            placeholder="Ваш вариант..."
            rows={3}
            maxLength={500}
            style={{
              width: "100%",
              padding: 12,
              borderRadius: 8,
              border: "1px solid #e2e8f0",
              fontSize: 14,
              fontFamily: "inherit",
              resize: "vertical",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>

        <SubmissionForm
          selectedItems={selectedItems}
          onSubmit={handleSubmit}
          privacyPolicyUrl={privacyPolicyUrl}
        />
      </Col>
    </Row>
  );
};

export default FormRenderer;
