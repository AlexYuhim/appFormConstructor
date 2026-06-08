# План мобильной адаптации и доработок

## Задача 1: Адаптивная мобильная вёрстка публичной формы

### Текущее состояние

Элементы в разделе отображаются сеткой `grid-template-columns: repeat(auto-fill, minmax(220px, 1fr))`.

### Требование

На мобильных устройствах элементы должны располагаться **горизонтально** (scrollable row).

### Изменения

**Файл:** [`frontend/src/components/public-form/SectionBlock.tsx`](frontend/src/components/public-form/SectionBlock.tsx)

Заменить сетку на flex с горизонтальным скроллом:

```tsx
<div
  style={{
    display: "flex",
    gap: "12px",
    overflowX: "auto",
    paddingBottom: "8px",
    WebkitOverflowScrolling: "touch",
    scrollSnapType: "x mandatory",
  }}
>
  {section.items.map((item) => (
    <div style={{ flex: "0 0 auto", minWidth: "200px", scrollSnapAlign: "start" }}>
      <ItemCard ... />
    </div>
  ))}
</div>
```

**Файл:** [`frontend/src/components/public-form/ItemCard.tsx`](frontend/src/components/public-form/ItemCard.tsx)

Уменьшить padding, шрифты для мобильных. Добавить touch-friendly размеры (min-height, крупные кнопки).

**Файл:** [`frontend/src/components/public-form/FormRenderer.tsx`](frontend/src/components/public-form/FormRenderer.tsx)

Добавить responsive padding (`padding: "20px 12px"` на мобильных вместо `40px 20px`).

---

## Задача 2: Анонимный раздел "свой вариант"

### Требование

Добавить текстовое поле в публичную форму: _"Если хотите принести что-то не из списка — напишите здесь"_ + input для текста.

### Изменения

**Бэкенд:**

1. [`backend/src/models/Submission.ts`](backend/src/models/Submission.ts) — добавить поле:

```typescript
customText?: string;
```

2. [`backend/src/types/submission.types.ts`](backend/src/types/submission.types.ts) — добавить в `SubmitFormDto`:

```typescript
customText?: string;
```

3. [`backend/src/services/submission.service.ts`](backend/src/services/submission.service.ts) — при создании Submission передавать `customText`, сделать это поле опциональным (не блокировать отправку).

**Фронтенд:**

4. [`frontend/src/types/submission.types.ts`](frontend/src/types/submission.types.ts) — добавить `customText?: string` в `SubmitFormDto`.

5. [`frontend/src/components/public-form/FormRenderer.tsx`](frontend/src/components/public-form/FormRenderer.tsx) — добавить блок с текстовым полем между секциями и формой:

```tsx
<div style={{...}}>
  <p>Если хотите принести что-то не из списка — напишите здесь:</p>
  <textarea
    value={customText}
    onChange={...}
    placeholder="Ваш вариант..."
    rows={3}
    style={{width: "100%", borderRadius: "8px", padding: "12px", border: "1px solid #e2e8f0"}}
  />
</div>
```

6. В `handleSubmit` передавать `customText`.

---

## Задача 3: Ссылка на опубликованную форму + title

### 3.1 Ссылка после публикации

**Файл:** [`frontend/src/components/form-builder/FormEditor.tsx`](frontend/src/components/form-builder/FormEditor.tsx)

После публикации (когда `currentForm.isPublished === true`) показывать под Slug:

```tsx
{
  currentForm.isPublished && (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        marginTop: "8px",
      }}
    >
      <span style={{ fontSize: "12px", color: "#16a34a" }}>🔗</span>
      <a
        href={`/form/${currentForm.slug}`}
        target="_blank"
        style={{ fontSize: "12px", color: "#6366f1" }}
      >
        {window.location.origin}/form/{currentForm.slug}
      </a>
    </div>
  );
}
```

### 3.2 Title страницы публичной формы

**Файл:** [`frontend/src/components/public-form/FormRenderer.tsx`](frontend/src/components/public-form/FormRenderer.tsx)

Добавить `useEffect` для установки `document.title`:

```tsx
useEffect(() => {
  if (currentForm?.form?.name) {
    document.title = `${currentForm.form.name} — Конструктор форм`;
  }
  return () => {
    document.title = "Конструктор форм";
  };
}, [currentForm]);
```

---

## Задача 4: Редактирование элементов разделов

### Текущее состояние

В [`SectionEditor.tsx`](frontend/src/components/form-builder/SectionEditor.tsx) у элементов есть только кнопка удаления.

### Требование

Добавить возможность редактировать элемент (label, description, requiredQuantity, unit).

### Изменения

**Файл:** [`frontend/src/components/form-builder/SectionEditor.tsx`](frontend/src/components/form-builder/SectionEditor.tsx)

1. Добавить состояние `editingItemId: string | null`
2. Добавить модальное окно редактирования элемента (аналог модалки создания из FormEditor)
3. Добавить кнопку ✏️ рядом с 🗑 для каждого элемента
4. При клике на ✏️ открывать модалку, предзаполненную текущими значениями
5. По сохранению вызывать `formsApi.updateItem()`

**Файл:** [`frontend/src/components/form-builder/FormEditor.tsx`](frontend/src/components/form-builder/FormEditor.tsx)

Убрать дублирование модалки создания элемента — вынести в отдельный компонент `ItemEditModal.tsx`, переиспользовать для создания и редактирования.

**Новый файл:** [`frontend/src/components/form-builder/ItemEditModal.tsx`](frontend/src/components/form-builder/ItemEditModal.tsx)

Универсальная модалка для создания/редактирования элемента:

- label (название)
- description (описание)
- requiredQuantity (требуемое количество) — с поддержкой ввода с клавиатуры
- unit (единица измерения)

---

## Задача 5: Убрать поле "тип" при создании элемента

### Требование

Поле "Тип" (food/item/service) не нужно пользователю. Убрать из модалки создания элемента.

### Изменения

**Файл:** [`frontend/src/components/form-builder/FormEditor.tsx`](frontend/src/components/form-builder/FormEditor.tsx)

1. Убрать весь блок `<div style={{ marginBottom: "16px" }}>` с label "Тип" и select (строки 207-239)
2. В `useState<CreateItemDto>` убрать поле `type` (оставить умолчание `type: "item"`)
3. В `handleAddItem` не передавать type

**Файл:** [`frontend/src/components/form-builder/SectionEditor.tsx`](frontend/src/components/form-builder/SectionEditor.tsx)

1. Убрать отображение `getTypeLabel(item.type)` в карточке элемента
2. Если поле type не отображается, импорт `getTypeLabel` тоже можно убрать

**Файл:** [`frontend/src/types/form.types.ts`](frontend/src/types/form.types.ts) (фронт)

В `CreateItemDto` сделать `type` опциональным:

```typescript
export interface CreateItemDto {
  label: string;
  description?: string;
  type?: "food" | "item" | "service";
  requiredQuantity: number;
  unit?: string;
}
```

---

## Задача 6: Поддержка клавиатурного ввода requiredQuantity

### Текущее состояние

Поле `requiredQuantity` использует `<input type="number">`. На мобильных это открывает цифровую клавиатуру, но значение можно менять только стрелками или вводом с клавиатуры.

### Требование

Пользователь должен иметь возможность вводить число как с клавиатуры, так и с сенсорного экрана.

### Изменения

**Файл:** [`frontend/src/components/form-builder/FormEditor.tsx`](frontend/src/components/form-builder/FormEditor.tsx)

Добавить `inputMode="numeric"` для поля requiredQuantity в модалке создания элемента:

```tsx
<Input
  label="Требуемое количество"
  type="number"
  inputMode="numeric"
  ...
/>
```

Также добавить кнопки "+" и "-" для удобства на мобильных:

```tsx
<div style={{display: "flex", gap: "8px", alignItems: "center"}}>
  <Button variant="secondary" onClick={() => setQuantity(Math.max(1, qty - 1))}>−</Button>
  <input type="number" value={qty} ... style={{flex: 1, textAlign: "center"}} />
  <Button variant="secondary" onClick={() => setQuantity(qty + 1)}>+</Button>
</div>
```

**Файл:** [`frontend/src/components/form-builder/ItemEditModal.tsx`](frontend/src/components/form-builder/ItemEditModal.tsx) (новый)

Аналогичные изменения в модалке редактирования.

---

## Сводная таблица изменений

| №   | Файл                                                     | Действие                                        | Тип         |
| --- | -------------------------------------------------------- | ----------------------------------------------- | ----------- |
| 1   | `backend/src/models/Submission.ts`                       | Добавить поле `customText`                      | Модификация |
| 2   | `backend/src/types/submission.types.ts`                  | Добавить `customText` в `SubmitFormDto`         | Модификация |
| 3   | `backend/src/services/submission.service.ts`             | Передавать `customText` при создании            | Модификация |
| 4   | `frontend/src/types/submission.types.ts`                 | Добавить `customText` в `SubmitFormDto`         | Модификация |
| 5   | `frontend/src/types/form.types.ts`                       | Сделать `type` опциональным в `CreateItemDto`   | Модификация |
| 6   | `frontend/src/components/public-form/SectionBlock.tsx`   | Горизонтальный scroll вместо grid               | Модификация |
| 7   | `frontend/src/components/public-form/ItemCard.tsx`       | Mobile-friendly стили (убрать type label)       | Модификация |
| 8   | `frontend/src/components/public-form/FormRenderer.tsx`   | +customText input, +document.title, +responsive | Модификация |
| 9   | `frontend/src/components/public-form/SubmissionForm.tsx` | Передавать customText в onSubmit                | Модификация |
| 10  | `frontend/src/components/form-builder/FormEditor.tsx`    | +ссылка на форму, убрать type, +keyboard input  | Модификация |
| 11  | `frontend/src/components/form-builder/SectionEditor.tsx` | +редактирование элементов, убрать type          | Модификация |
| 12  | `frontend/src/components/form-builder/ItemEditModal.tsx` | **НОВЫЙ** — универсальная модалка               | Создание    |
