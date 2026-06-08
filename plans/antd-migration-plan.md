# План миграции на Ant Design

## Цель

Заменить самописные UI-компоненты на Ant Design v5, получив готовую адаптивность, компоненты форм, таблицы и уведомления.

---

## Этап 0: Подготовка

### 0.1 Установка

```bash
cd frontend && npm install antd @ant-design/icons
```

### 0.2 ConfigProvider в `main.tsx`

Завернуть `<App />` в `<ConfigProvider>` с темой и русской локализацией:

```tsx
import { ConfigProvider } from "antd";
import ruRU from "antd/locale/ru_RU";

const theme = {
  token: {
    colorPrimary: "#6366f1",
    borderRadius: 8,
  },
};

// В рендере:
<ConfigProvider theme={theme} locale={ruRU}>
  <BrowserRouter>
    <App />
  </BrowserRouter>
</ConfigProvider>;
```

---

## Этап 1: UI-компоненты (5 замен)

| Старый файл                        | Ant Design   | Ключевые пропсы                                                  |
| ---------------------------------- | ------------ | ---------------------------------------------------------------- |
| `components/ui/Button.tsx`         | `<Button>`   | `type="primary"`, `danger`, `ghost`, `loading`, `disabled`       |
| `components/ui/Input.tsx`          | `<Input>`    | `status="error"`, заменить `error` → `status="error"`            |
| `components/ui/Modal.tsx`          | `<Modal>`    | `open` (вместо `isOpen`), `onCancel` (вместо `onClose`), `title` |
| `components/ui/LoadingSpinner.tsx` | `<Spin>`     | `tip`, `size`                                                    |
| `components/ui/ProgressBar.tsx`    | `<Progress>` | `percent`, `strokeColor`, `format`                               |

**Замена пропсов:**

| Сейчас                | Ant Design                                             |
| --------------------- | ------------------------------------------------------ |
| `variant="primary"`   | `type="primary"`                                       |
| `variant="secondary"` | `type="default"`                                       |
| `variant="danger"`    | `danger`                                               |
| `variant="ghost"`     | `type="link"`                                          |
| `isLoading`           | `loading`                                              |
| `isOpen`              | `open`                                                 |
| `onClose`             | `onCancel`                                             |
| `error` (строка)      | `status="error"` + показывать ошибку через `Form.Item` |

---

## Этап 2: Layout (3 файла → antd Layout)

### Header → antd Layout.Header

```tsx
import { Layout, Typography } from "antd";

<Layout.Header
  style={{ padding: "0 24px", display: "flex", alignItems: "center" }}
>
  <Typography.Title level={4} style={{ margin: 0, color: "#fff" }}>
    Конструктор форм
  </Typography.Title>
</Layout.Header>;
```

### Sidebar → antd Layout.Sider + Menu

```tsx
import { Layout, Menu, Button } from "antd";
import {
  DashboardOutlined,
  FormOutlined,
  LogoutOutlined,
} from "@ant-design/icons";

<Layout.Sider width={220} theme="dark">
  <Menu
    theme="dark"
    mode="inline"
    selectedKeys={[location.pathname]}
    items={[
      { key: "/admin", icon: <DashboardOutlined />, label: "Дашборд" },
      { key: "/admin/forms", icon: <FormOutlined />, label: "Формы" },
    ]}
    onClick={({ key }) => navigate(key)}
  />
</Layout.Sider>;
```

### AdminLayout → antd Layout

```tsx
<Layout style={{ minHeight: "100vh" }}>
  <Sidebar />
  <Layout>
    <Header />
    <Layout.Content style={{ padding: 24, background: "#f5f5f5" }}>
      <Outlet />
    </Layout.Content>
  </Layout>
</Layout>
```

---

## Этап 3: Публичная форма (4 файла)

### SectionBlock → Card + Checkbox

```tsx
import { Card, Checkbox, Typography } from "antd";

<Card title={section.name} size="small" style={{ marginBottom: 12 }}>
  {section.items.map((item) => (
    <div key={item.id} style={{ marginBottom: 8 }}>
      <Checkbox
        checked={selectedItemId === item.id}
        onChange={() => onSelectItem(section.id, item.id)}
        disabled={item.status === "full"}
      >
        <Typography.Text strong>{item.label}</Typography.Text>
        <Typography.Text
          type="secondary"
          style={{ fontSize: 12, display: "block" }}
        >
          {getStatusLabel(item.status)} · {item.currentQuantity}/
          {item.requiredQuantity} {item.unit || "шт"}
        </Typography.Text>
      </Checkbox>
    </div>
  ))}
</Card>;
```

### ItemCard → удалить (логика внутри SectionBlock)

### SubmissionForm → antd Form

```tsx
import { Form, Input, Checkbox, Button } from "antd";

<Form layout="vertical" onFinish={handleSubmit}>
  <Form.Item
    label="Имя"
    name="userName"
    rules={[{ required: true, min: 2, max: 100 }]}
  >
    <Input placeholder="Введите имя" />
  </Form.Item>
  <Form.Item
    label="Фамилия"
    name="userSurname"
    rules={[{ required: true, min: 2, max: 100 }]}
  >
    <Input placeholder="Введите фамилию" />
  </Form.Item>
  <Form.Item
    name="consent"
    valuePropName="checked"
    rules={[
      {
        validator: (_, v) =>
          v ? Promise.resolve() : Promise.reject("Необходимо согласие"),
      },
    ]}
  >
    <Checkbox>
      Подтверждаю согласие на{" "}
      {privacyPolicyUrl ? (
        <a href={privacyPolicyUrl} target="_blank" style={{ color: "#6366f1" }}>
          обработку персональных данных
        </a>
      ) : (
        <span style={{ color: "#6366f1" }}>обработку персональных данных</span>
      )}
    </Checkbox>
  </Form.Item>
  <Form.Item>
    <Button type="primary" htmlType="submit" block disabled={!consent}>
      Отправить
    </Button>
  </Form.Item>
</Form>;
```

### FormRenderer → Row/Col для адаптивности

```tsx
import { Row, Col } from "antd";

<Row justify="center">
  <Col xs={24} sm={22} md={20} lg={16} xl={14}>
    {/* содержимое */}
  </Col>
</Row>;
```

---

## Этап 4: Страницы админки (6 файлов)

### LoginPage → Card + Form

```tsx
<Row
  justify="center"
  align="middle"
  style={{ minHeight: "100vh", background: "#f5f5f5" }}
>
  <Col xs={22} sm={16} md={12} lg={8}>
    <Card>
      <Typography.Title level={3} style={{ textAlign: "center" }}>
        Конструктор форм
      </Typography.Title>
      <Form onFinish={handleLogin}>
        <Form.Item name="email" rules={[{ required: true, type: "email" }]}>
          <Input prefix={<MailOutlined />} placeholder="Email" />
        </Form.Item>
        <Form.Item name="password" rules={[{ required: true }]}>
          <Input.Password prefix={<LockOutlined />} placeholder="Пароль" />
        </Form.Item>
        <Button type="primary" htmlType="submit" block loading={isLoading}>
          Войти
        </Button>
      </Form>
    </Card>
  </Col>
</Row>
```

### DashboardPage → Statistic + Row

```tsx
<Row gutter={[16, 16]}>
  <Col xs={24} sm={8}>
    <Card>
      <Statistic
        title="Всего форм"
        value={totalForms}
        valueStyle={{ color: "#6366f1" }}
      />
    </Card>
  </Col>
  <Col xs={24} sm={8}>
    <Card>
      <Statistic
        title="Опубликовано"
        value={publishedForms}
        valueStyle={{ color: "#22c55e" }}
      />
    </Card>
  </Col>
  <Col xs={24} sm={8}>
    <Card>
      <Statistic
        title="Черновики"
        value={totalForms - publishedForms}
        valueStyle={{ color: "#eab308" }}
      />
    </Card>
  </Col>
</Row>
```

### FormListPage → Table

```tsx
<Table
  dataSource={forms}
  columns={columns}
  loading={isLoading}
  onRow={(record) => ({
    onClick: () => navigate(`/admin/forms/${record._id}/edit`),
  })}
/>
```

### FormEditor → Form + message

Оповещения:

```tsx
import { message } from "antd";

// Вместо setSuccessMessage
if (result) message.success("Форма сохранена");

// Вместо error баннера
if (error) message.error(error);
```

### FormStatisticsPage → Tabs + Table

```tsx
<Tabs
  items={[
    { key: "stats", label: "📊 Прогресс", children: <StatisticsTable /> },
    {
      key: "submissions",
      label: `📋 Заявки (${total})`,
      children: <SubmissionsTable />,
    },
  ]}
/>
```

### NotFoundPage → Result

```tsx
import { Result, Button } from "antd";

<Result
  status="404"
  title="404"
  subTitle="Страница не найдена"
  extra={
    <Button type="primary" onClick={() => navigate("/admin")}>
      На главную
    </Button>
  }
/>;
```

---

## Этап 5: Чистка

Удалить папки:

```
frontend/src/components/ui/          (Button, Input, Modal, LoadingSpinner, ProgressBar)
frontend/src/components/layout/      (Header, Sidebar, AdminLayout)
```

Обновить импорты: `import { Button } from "antd"` вместо `import Button from "../ui/Button"`.

---

## Что НЕ меняется

| Модуль           | Причина                       |
| ---------------- | ----------------------------- |
| `src/api/`       | axios клиент не зависит от UI |
| `src/store/`     | Zustand не зависит от UI      |
| `src/types/`     | Типы не зависят от UI         |
| `src/hooks/`     | Хуки не зависят от UI         |
| `src/services/`  | Сервисы не зависят от UI      |
| **Весь backend** | Не затрагивается              |

---

## Порядок коммитов

```
Коммит 1:  antd установка + ConfigProvider + замена UI-компонентов
Коммит 2:  Layout (Header, Sidebar, AdminLayout → antd)
Коммит 3:  Публичная форма (SectionBlock, SubmissionForm, FormRenderer)
Коммит 4:  Страницы админки (все 6 страниц)
Коммит 5:  Чистка (удаление ui/ и layout/ старых компонентов)
```
