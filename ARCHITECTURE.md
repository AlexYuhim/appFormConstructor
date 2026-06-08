# Архитектура приложения «Конструктор форм для мероприятий»

## Содержание

1. [Архитектурная схема](#1-архитектурная-схема)
2. [Структура проекта](#2-структура-проекта)
3. [Модули системы](#3-модули-системы)
4. [Схема MongoDB](#4-схема-mongodb)
5. [API Endpoints](#5-api-endpoints)
6. [План реализации](#6-план-реализации)
7. [Валидация и ограничения](#7-валидация-и-ограничения)

---

## 1. Архитектурная схема

### 1.1 Общая архитектура

Приложение построено по архитектуре «клиент-сервер» с разделением на три основных слоя:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           FRONTEND (React + Vite + TypeScript)              │
│                                                                             │
│  ┌─────────────────────────────┐      ┌────────────────────────────────┐   │
│  │      Admin Panel            │      │      Public Form               │   │
│  │  - Управление формами       │      │  - Отображение формы по slug   │   │
│  │  - Конструктор разделов     │      │  - Заполнение и отправка       │   │
│  │  - Редактор элементов       │      │  - Real-time статусы элементов │   │
│  │  - Статистика и аналитика   │      │  - Блокировка при лимите       │   │
│  └──────────┬──────────────────┘      └────────────┬───────────────────┘   │
│             │  HTTP/HTTPS                           │  HTTP/HTTPS           │
│             │  WebSocket (Socket.io)                │  WebSocket            │
└─────────────┼──────────────────────────────────────┼───────────────────────┘
              │                                       │
              ▼                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          BACKEND (Node.js + Express)                        │
│                                                                             │
│  ┌──────────┐  ┌──────────────┐  ┌────────────┐  ┌──────────────────┐     │
│  │  REST    │  │  WebSocket   │  │   Auth     │  │   Validation     │     │
│  │  Router  │  │  Gateway     │  │  Middleware │  │   Middleware     │     │
│  └────┬─────┘  └──────┬───────┘  └─────┬──────┘  └───────┬──────────┘     │
│       │               │                │                 │                │
│       ▼               ▼                ▼                 ▼                │
│  ┌──────────────────────────────────────────────────────────────────┐      │
│  │                    Controllers / Services                        │      │
│  │  ┌────────────┐ ┌──────────┐ ┌──────────┐ ┌────────────────┐    │      │
│  │  │ FormCtrl   │ │SectionCtrl│ │ItemCtrl  │ │SubmissionCtrl  │    │      │
│  │  └────────────┘ └──────────┘ └──────────┘ └────────────────┘    │      │
│  │  ┌────────────┐ ┌──────────┐ ┌────────────────────────────┐     │      │
│  │  │ AuthCtrl   │ │StatCtrl  │ │ WebSocket Manager          │     │      │
│  │  └────────────┘ └──────────┘ └────────────────────────────┘     │      │
│  └──────────────────────────────────────────────────────────────────┘      │
│                                    │                                       │
│                                    ▼                                       │
│  ┌──────────────────────────────────────────────────────────────────┐      │
│  │                    Mongoose Models (ODM)                          │      │
│  │  ┌─────────┐ ┌─────────────┐ ┌──────────┐ ┌────────────────┐    │      │
│  │  │  Form   │ │ FormSection │ │ FormItem │ │  Submission    │    │      │
│  │  └─────────┘ └─────────────┘ └──────────┘ └────────────────┘    │      │
│  │  ┌────────────────┐                                              │      │
│  │  │ SelectedItem    │  ┌─────────┐                                │      │
│  │  └────────────────┘  │  Admin  │                                │      │
│  │                      └─────────┘                                │      │
│  └──────────────────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
              ┌─────────────────────────────────────────┐
              │               MongoDB                    │
              │                                         │
              │  ┌──────────┐ ┌──────────────┐          │
              │  │  forms   │ │ formSections  │          │
              │  └──────────┘ └──────────────┘          │
              │  ┌──────────┐ ┌──────────────┐          │
              │  │ formItems│ │ submissions   │          │
              │  └──────────┘ └──────────────┘          │
              │  ┌──────────────┐                       │
              │  │selectedItems │  ┌─────────┐          │
              │  └──────────────┘  │ admins  │          │
              │                    └─────────┘          │
              └─────────────────────────────────────────┘
```

### 1.2 Взаимодействие компонентов

| Компоненты           | Протокол       | Назначение                                    |
| -------------------- | -------------- | --------------------------------------------- |
| Frontend ↔ Backend   | HTTP REST      | CRUD-операции с формами, аутентификация       |
| Frontend ↔ Backend   | WebSocket      | Real-time обновления статусов элементов       |
| Backend ↔ MongoDB    | TCP (Mongoose) | Чтение/запись данных                          |
| Admin Panel ↔ Public | WebSocket      | Оповещение администратора о новых заполнениях |

### 1.3 Поток данных (заполнение формы)

```
Участник                    Backend                     MongoDB              Admin
    │                          │                          │                    │
    │  GET /api/forms/:slug    │                          │                    │
    │ ─────────────────────►   │   find form + sections   │                    │
    │                         │ ─────────────────────►    │                    │
    │                         │ ◀───────────────────────  │                    │
    │ ◀────────────────────    │                          │                    │
    │                          │                          │                    │
    │  Заполняет форму         │                          │                    │
    │                          │                          │                    │
    │  POST /api/forms/:slug/submit                      │                    │
    │ ─────────────────────►   │                          │                    │
    │                         │  Валидация:               │                    │
    │                         │  - имя, фамилия, согласие │                    │
    │                         │  - лимиты по элементам    │                    │
    │                         │  - один пункт на раздел   │                    │
    │                         │                          │                    │
    │                         │  create submission        │                    │
    │                         │ ─────────────────────►    │                    │
    │                         │  update selectedItems     │                    │
    │                         │ ─────────────────────►    │                    │
    │                         │                          │                    │
    │ ◀─── 201 Created ──────  │                          │                    │
    │                          │                          │                    │
    │                         │  WebSocket: itemStatusChanged              │
    │                         │ ──────────────────────────────────────────► │
    │                         │                          │                    │
    │  WebSocket: itemStatusChanged                                       │
    │ ◄───────────────────────────────────────────────────────────────────  │
    │                          │                          │                    │
```

---

## 2. Структура проекта

Монорепозиторий с двумя пакетами: `backend` и `frontend`.

```
/root
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.ts                 # Подключение к MongoDB
│   │   │   ├── env.ts               # Валидация переменных окружения
│   │   │   └── socket.ts            # Конфигурация Socket.io
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts   # Аутентификация
│   │   │   ├── form.controller.ts   # CRUD форм
│   │   │   ├── section.controller.ts# CRUD разделов
│   │   │   ├── item.controller.ts   # CRUD элементов
│   │   │   ├── submission.controller.ts # Обработка заявок
│   │   │   └── statistics.controller.ts # Статистика
│   │   ├── models/
│   │   │   ├── Form.ts
│   │   │   ├── FormSection.ts
│   │   │   ├── FormItem.ts
│   │   │   ├── Submission.ts
│   │   │   ├── SelectedItem.ts
│   │   │   └── Admin.ts
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   ├── form.routes.ts
│   │   │   └── public.routes.ts
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts    # JWT верификация
│   │   │   ├── validation.middleware.ts # Валидация запросов
│   │   │   └── error.middleware.ts   # Глобальная обработка ошибок
│   │   ├── services/
│   │   │   ├── form.service.ts      # Бизнес-логика форм
│   │   │   ├── submission.service.ts # Бизнес-логика заявок
│   │   │   ├── statistics.service.ts # Аналитика
│   │   │   └── socket.service.ts    # Управление WebSocket
│   │   ├── types/
│   │   │   ├── form.types.ts
│   │   │   ├── submission.types.ts
│   │   │   └── socket.types.ts
│   │   ├── utils/
│   │   │   ├── slugify.ts
│   │   │   └── helpers.ts
│   │   ├── app.ts                   # Express app setup
│   │   └── server.ts                # Точка входа (HTTP + WebSocket)
│   ├── package.json
│   ├── tsconfig.json
│   ├── Dockerfile
│   ├── .env.example
│   └── .eslintrc.js
├── frontend/
│   ├── public/
│   │   └── favicon.ico
│   ├── src/
│   │   ├── api/
│   │   │   ├── client.ts            # Axios instance с перехватчиками
│   │   │   ├── auth.api.ts          # API запросы аутентификации
│   │   │   ├── forms.api.ts         # API запросы форм
│   │   │   └── submissions.api.ts   # API запросы заявок
│   │   ├── components/
│   │   │   ├── ui/                  # Переиспользуемые UI-компоненты
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── Modal.tsx
│   │   │   │   ├── LoadingSpinner.tsx
│   │   │   │   └── ProgressBar.tsx
│   │   │   ├── form-builder/        # Конструктор форм
│   │   │   │   ├── FormEditor.tsx
│   │   │   │   ├── SectionEditor.tsx
│   │   │   │   ├── ItemEditor.tsx
│   │   │   │   ├── DragDropList.tsx
│   │   │   │   └── PreviewPanel.tsx
│   │   │   ├── public-form/         # Публичная форма
│   │   │   │   ├── FormRenderer.tsx
│   │   │   │   ├── SectionBlock.tsx
│   │   │   │   ├── ItemCard.tsx
│   │   │   │   └── SubmissionForm.tsx
│   │   │   ├── statistics/          # Статистика
│   │   │   │   ├── StatisticsTable.tsx
│   │   │   │   ├── ProgressChart.tsx
│   │   │   │   └── ItemStatusBadge.tsx
│   │   │   └── layout/             # Компоновка
│   │   │       ├── AdminLayout.tsx
│   │   │       ├── Sidebar.tsx
│   │   │       └── Header.tsx
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── useSocket.ts         # WebSocket подключение
│   │   │   ├── useFormBuilder.ts
│   │   │   └── useFormSubmission.ts
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   │   ├── LoginPage.tsx
│   │   │   │   ├── DashboardPage.tsx
│   │   │   │   ├── FormListPage.tsx
│   │   │   │   ├── FormEditorPage.tsx
│   │   │   │   ├── FormStatisticsPage.tsx
│   │   │   │   └── NotFoundPage.tsx
│   │   │   └── public/
│   │   │       └── PublicFormPage.tsx
│   │   ├── services/
│   │   │   ├── socket.service.ts    # Клиент Socket.io
│   │   │   └── auth.service.ts      # Управление токенами
│   │   ├── store/                   # Состояние (Zustand или Context)
│   │   │   ├── auth.store.ts
│   │   │   └── form.store.ts
│   │   ├── types/
│   │   │   ├── form.types.ts
│   │   │   ├── submission.types.ts
│   │   │   └── socket.types.ts
│   │   ├── utils/
│   │   │   ├── validation.ts
│   │   │   └── format.ts
│   │   ├── App.tsx                  # Корневой компонент с роутингом
│   │   ├── main.tsx                 # Точка входа
│   │   └── vite-env.d.ts
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   ├── vite.config.ts
│   ├── Dockerfile
│   └── .env.example
├── docker-compose.yml
├── nginx/
│   └── nginx.conf                   # Reverse proxy для production
├── .gitignore
├── .env.example                     # Корневой env-файл
└── README.md
```

---

## 3. Модули системы

### 3.1 Модуль аутентификации администратора

**Назначение:** Обеспечение безопасного доступа к админ-панели.

| Компонент       | Технология    | Описание                               |
| --------------- | ------------- | -------------------------------------- |
| Admin Model     | Mongoose      | Хранит хешированный пароль (bcrypt)    |
| Auth Controller | Express       | Обрабатывает login/register            |
| JWT Middleware  | jsonwebtoken  | Верифицирует access token в заголовках |
| Auth Service    | React Context | Хранит токен, управляет logout         |
| Protected Route | React Router  | Guard для админ-роутов                 |

**Поток аутентификации:**

```
Клиент                    Backend
   │                         │
   │ POST /api/admin/auth/login
   │ { email, password }     │
   │ ──────────────────────► │
   │                         │ Проверка email в БД
   │                         │ bcrypt.compare(password, hash)
   │                         │ Генерация JWT { adminId, role }
   │ { token, admin }        │
   │ ◀────────────────────── │
   │                         │
   │ (Во всех последующих запросах)
   │ Authorization: Bearer <token>
   │ ──────────────────────► │ JWT Middleware верифицирует
```

**Токены:**

- **Access token:** 24 часа, хранится в localStorage / httpOnly cookie
- **Refresh token** (опционально): 7 дней для продления сессии

### 3.2 Модуль конструктора форм

**Назначение:** CRUD-операции для управления формами, разделами и элементами.

**Иерархия сущностей:**

```
Форма (Form)
 └── Раздел (FormSection) — упорядоченная группа элементов
      └── Элемент (FormItem) — конкретный пункт для заполнения
```

**Возможности:**

- Создание/редактирование/удаление формы
- Добавление/удаление разделов (drag-and-drop сортировка)
- Добавление/редактирование элементов внутри разделов
- Установка лимитов (requiredQuantity) для каждого элемента
- Публикация / снятие с публикации формы
- Предпросмотр формы перед публикацией

**Типы элементов (Type):**

- `food` — продукт/блюдо (с единицей измерения)
- `item` — вещь/предмет
- `service` — услуга/помощь

### 3.3 Модуль публичных форм

**Назначение:** Предоставление доступа участникам к заполнению формы.

**Поток участника:**

```
1. Участник переходит по ссылке /form/<slug>
2. Система загружает форму с разделами и элементами
3. Участник выбирает элементы (один на раздел)
4. Заполняет обязательные поля: имя, фамилия, согласие на ПД
5. Отправляет форму
6. Система валидирует лимиты, создаёт запись
7. WebSocket оповещает администратора и других участников
```

**Ограничения:**

- Один участник может выбрать только **один элемент** в каждом разделе
- Если элемент достиг лимита (`currentQuantity >= requiredQuantity`), он блокируется
- Если все элементы в разделе заблокированы — раздел помечается как `full`
- Участник видит актуальные статусы элементов в реальном времени

### 3.4 Модуль статистики и аналитики

**Назначение:** Визуализация данных о заполнении формы.

**Метрики:**

- Общее количество заявок
- Количество заявок по каждому элементу
- Прогресс заполнения (currentQuantity / requiredQuantity) для каждого элемента
- Список участников с детализацией выбранных позиций
- Временная шкала поступления заявок

**Представление:**

- Таблица со списком всех заявок
- Прогресс-бары для каждого элемента
- Статусы: `available` — доступно, `limited` — почти заполнено (>80%), `full` — заполнено

### 3.5 Модуль real-time обновлений

**Назначение:** Мгновенное оповещение об изменениях через WebSocket (Socket.io).

**События (Server → Client):**

| Событие             | Данные                                | Адресат       |
| ------------------- | ------------------------------------- | ------------- |
| `itemStatusChanged` | `{ itemId, currentQuantity, status }` | Все клиенты   |
| `formUpdated`       | `{ formId, action }`                  | Администратор |
| `newSubmission`     | `{ formId, userName, items[] }`       | Администратор |
| `sectionFilled`     | `{ sectionId, formId }`               | Все клиенты   |
| `admin:statsUpdate` | `{ formId, stats }`                   | Администратор |

**Комнаты Socket.io:**

- `form:<formId>` — подписка на обновления конкретной формы (все клиенты)
- `admin:<adminId>` — подписка на админ-уведомления

**Подключение на клиенте:**

```typescript
// socket.service.ts
const socket = io(API_URL, {
  auth: { token }, // для админа
  transports: ["websocket"],
});

// Подписка на обновления формы
socket.emit("join:form", formId);

// Слушаем изменения элементов
socket.on("itemStatusChanged", (data) => {
  // Обновляем состояние в реальном времени
});
```

---

## 4. Схема MongoDB

### 4.1 Коллекция `admins`

```javascript
{
  _id: ObjectId,
  email: String,          // unique, required
  password: String,       // bcrypt hash, required
  name: String,           // required
  role: String,           // enum: ['admin', 'superadmin'], default: 'admin'
  createdAt: Date,        // default: Date.now
  updatedAt: Date         // default: Date.now
}

// Индексы:
// { email: 1 } — unique
```

### 4.2 Коллекция `forms`

```javascript
{
  _id: ObjectId,
  name: String,             // required, maxlength: 200
  slug: String,             // unique, required, генерируется из name
  description: String,      // опционально, maxlength: 1000
  isPublished: Boolean,     // default: false
  createdBy: ObjectId,      // ref: Admin
  createdAt: Date,          // default: Date.now
  updatedAt: Date           // default: Date.now
}

// Индексы:
// { slug: 1 } — unique
// { createdBy: 1 }
// { isPublished: 1 }
```

### 4.3 Коллекция `formSections`

```javascript
{
  _id: ObjectId,
  formId: ObjectId,         // ref: Form, required
  name: String,             // required, maxlength: 200
  description: String,      // опционально
  order: Number,            // required, порядок сортировки
  createdAt: Date,
  updatedAt: Date
}

// Индексы:
// { formId: 1, order: 1 }
```

### 4.4 Коллекция `formItems`

```javascript
{
  _id: ObjectId,
  sectionId: ObjectId,      // ref: FormSection, required
  label: String,            // required, maxlength: 300
  description: String,      // опционально, maxlength: 500
  type: String,             // enum: ['food', 'item', 'service'], default: 'item'
  requiredQuantity: Number, // required, min: 1, default: 1
  currentQuantity: Number,  // required, min: 0, default: 0 (счётчик заполнений)
  unit: String,             // опционально (кг, шт, порций, литров...)
  isActive: Boolean,        // default: true
  order: Number,            // required, порядок в разделе
  createdAt: Date,
  updatedAt: Date
}

// Индексы:
// { sectionId: 1, order: 1 }
// { sectionId: 1, isActive: 1 }
```

### 4.5 Коллекция `submissions`

```javascript
{
  _id: ObjectId,
  formId: ObjectId,         // ref: Form, required
  userName: String,         // required, minlength: 2, maxlength: 100
  userSurname: String,      // required, minlength: 2, maxlength: 100
  consentGiven: Boolean,    // required, default: false (согласие на ПД)
  submittedAt: Date,        // default: Date.now
  ipAddress: String,        // опционально, для антиспама
  userAgent: String         // опционально
}

// Индексы:
// { formId: 1, submittedAt: -1 }
// { formId: 1, userName: 1, userSurname: 1 }
```

### 4.6 Коллекция `selectedItems`

```javascript
{
  _id: ObjectId,
  submissionId: ObjectId,   // ref: Submission, required
  itemId: ObjectId,         // ref: FormItem, required
  quantity: Number,         // required, default: 1, min: 1
  sectionId: ObjectId       // ref: FormSection, денормализовано для быстрых запросов
}

// Индексы:
// { submissionId: 1 }
// { itemId: 1 }
// { submissionId: 1, sectionId: 1 } — unique compound (один элемент на раздел)
```

### 4.7 ER-диаграмма (текстовая)

```
┌──────────────┐       ┌──────────────────┐
│    Admin     │       │      Form        │
│──────────────│       │──────────────────│
│ _id          │──┐    │ _id              │──┐
│ email        │  │    │ name             │  │
│ password     │  │    │ slug (unique)    │  │
│ name         │  │    │ description      │  │
│ role         │  │    │ isPublished      │  │
│ createdAt    │  │    │ createdBy ───────┘  │
│ updatedAt    │  │    │ createdAt         │  │
└──────────────┘  │    │ updatedAt         │  │
                  │    └────────┬─────────┘  │
                  │             │            │
                  │             │ 1:N        │
                  │             ▼            │
                  │    ┌──────────────────┐  │
                  │    │  FormSection     │  │
                  │    │──────────────────│  │
                  │    │ _id              │  │
                  │    │ formId ──────────┘  │
                  │    │ name                │
                  │    │ description         │
                  │    │ order               │
                  │    │ createdAt           │
                  │    │ updatedAt           │
                  │    └────────┬───────────┘
                  │             │
                  │             │ 1:N
                  │             ▼
                  │    ┌──────────────────┐
                  │    │   FormItem       │
                  │    │──────────────────│
                  │    │ _id              │
                  │    │ sectionId ───────┘
                  │    │ label
                  │    │ description
                  │    │ type
                  │    │ requiredQuantity
                  │    │ currentQuantity
                  │    │ unit
                  │    │ isActive
                  │    │ order
                  │    │ createdAt
                  │    │ updatedAt
                  │    └────────┬───────────┘
                  │             │
                  │             │ 1:N (через selectedItems)
                  │             ▼
                  │    ┌──────────────────┐
                  │    │   Submission     │
                  │    │──────────────────│
                  │    │ _id              │
                  │    │ formId ──────────┤
                  │    │ userName         │
                  │    │ userSurname      │
                  │    │ consentGiven     │
                  │    │ submittedAt      │
                  │    └────────┬─────────┘
                  │             │
                  │             │ 1:N
                  │             ▼
                  │    ┌──────────────────┐
                  │    │  SelectedItem    │
                  │    │──────────────────│
                  │    │ _id              │
                  │    │ submissionId ────┘
                  │    │ itemId ──────────┤
                  │    │ quantity         │
                  │    │ sectionId ───────┤
                  └────┴──────────────────┘
```

### 4.8 Денормализация `currentQuantity`

Поле `currentQuantity` в коллекции `formItems` является денормализованным счётчиком. Оно обновляется атомарно при каждой новой заявке:

```javascript
// При создании заявки атомарно увеличиваем счётчик
await FormItem.findByIdAndUpdate(itemId, {
  $inc: { currentQuantity: selectedQuantity },
});
```

Этот подход выбран для:

- Минимизации запросов при отображении статусов
- Избежания race condition при конкурентных заявках
- Простоты real-time обновлений (один запрос на обновление счётчика)

---

## 5. API Endpoints

### 5.1 Аутентификация

| Метод | Путь                       | Описание                | Auth |
| ----- | -------------------------- | ----------------------- | ---- |
| POST  | `/api/admin/auth/login`    | Вход администратора     | ❌   |
| POST  | `/api/admin/auth/register` | Регистрация (первичная) | ❌   |
| GET   | `/api/admin/auth/me`       | Текущий пользователь    | ✅   |

**POST `/api/admin/auth/login`**

```json
// Request
{ "email": "admin@example.com", "password": "securePass123" }

// Response 200
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "admin": { "id": "...", "email": "...", "name": "..." }
}

// Response 401
{ "error": "Неверный email или пароль" }
```

### 5.2 Управление формами (Admin)

| Метод  | Путь                             | Описание                    | Auth |
| ------ | -------------------------------- | --------------------------- | ---- |
| POST   | `/api/admin/forms`               | Создание формы              | ✅   |
| GET    | `/api/admin/forms`               | Список всех форм            | ✅   |
| GET    | `/api/admin/forms/:id`           | Получение формы с разделами | ✅   |
| PUT    | `/api/admin/forms/:id`           | Обновление формы            | ✅   |
| DELETE | `/api/admin/forms/:id`           | Удаление формы              | ✅   |
| POST   | `/api/admin/forms/:id/publish`   | Публикация формы            | ✅   |
| POST   | `/api/admin/forms/:id/unpublish` | Снятие с публикации         | ✅   |

### 5.3 Управление разделами (Admin)

| Метод  | Путь                                        | Описание            | Auth |
| ------ | ------------------------------------------- | ------------------- | ---- |
| POST   | `/api/admin/forms/:formId/sections`         | Создание раздела    | ✅   |
| PUT    | `/api/admin/forms/:formId/sections/:id`     | Обновление раздела  | ✅   |
| DELETE | `/api/admin/forms/:formId/sections/:id`     | Удаление раздела    | ✅   |
| PUT    | `/api/admin/forms/:formId/sections/reorder` | Сортировка разделов | ✅   |

### 5.4 Управление элементами (Admin)

| Метод  | Путь                                                         | Описание             | Auth |
| ------ | ------------------------------------------------------------ | -------------------- | ---- |
| POST   | `/api/admin/forms/:formId/sections/:sectionId/items`         | Создание элемента    | ✅   |
| PUT    | `/api/admin/forms/:formId/sections/:sectionId/items/:id`     | Обновление элемента  | ✅   |
| DELETE | `/api/admin/forms/:formId/sections/:sectionId/items/:id`     | Удаление элемента    | ✅   |
| PUT    | `/api/admin/forms/:formId/sections/:sectionId/items/reorder` | Сортировка элементов | ✅   |

### 5.5 Публичные эндпоинты (без аутентификации)

| Метод | Путь                      | Описание                       |
| ----- | ------------------------- | ------------------------------ |
| GET   | `/api/forms/:slug`        | Получение опубликованной формы |
| POST  | `/api/forms/:slug/submit` | Отправка заявки                |

**GET `/api/forms/:slug`**

```json
// Response 200
{
  "form": {
    "id": "...",
    "name": "Пир любви 2026",
    "description": "Помогите нам организовать праздник!",
    "sections": [
      {
        "id": "...",
        "name": "Угощения",
        "order": 1,
        "items": [
          {
            "id": "...",
            "label": "Пирог с капустой",
            "description": "Домашний пирог",
            "type": "food",
            "requiredQuantity": 5,
            "currentQuantity": 3,
            "unit": "шт",
            "status": "available"
          }
        ]
      }
    ]
  }
}
```

> **Важно:** Поле `status` вычисляется на основе `currentQuantity` и `requiredQuantity`:
>
> - `available` — `currentQuantity < requiredQuantity * 0.8`
> - `limited` — `currentQuantity >= requiredQuantity * 0.8`
> - `full` — `currentQuantity >= requiredQuantity`

**POST `/api/forms/:slug/submit`**

```json
// Request
{
  "userName": "Иван",
  "userSurname": "Петров",
  "consentGiven": true,
  "selectedItems": [
    { "itemId": "...", "sectionId": "...", "quantity": 1 }
  ]
}

// Response 201
{
  "submission": {
    "id": "...",
    "formId": "...",
    "userName": "Иван",
    "userSurname": "Петров",
    "submittedAt": "2026-06-08T12:00:00Z"
  }
}

// Response 409 (конфликт лимита)
{
  "error": "Элемент 'Пирог с капустой' достиг лимита",
  "itemId": "...",
  "status": "full"
}

// Response 400 (валидация)
{
  "error": "Не выбран элемент в разделе 'Угощения'"
}
```

### 5.6 Статистика

| Метод | Путь                                     | Описание                 | Auth |
| ----- | ---------------------------------------- | ------------------------ | ---- |
| GET   | `/api/admin/forms/:id/statistics`        | Статистика по форме      | ✅   |
| GET   | `/api/admin/forms/:id/statistics/export` | Экспорт в CSV/JSON       | ✅   |
| GET   | `/api/admin/forms/:id/submissions`       | Список заявок с деталями | ✅   |

**GET `/api/admin/forms/:id/statistics`**

```json
// Response 200
{
  "formId": "...",
  "totalSubmissions": 42,
  "sections": [
    {
      "sectionId": "...",
      "sectionName": "Угощения",
      "totalItems": 5,
      "filledItems": 3,
      "items": [
        {
          "itemId": "...",
          "label": "Пирог с капустой",
          "requiredQuantity": 5,
          "currentQuantity": 3,
          "unit": "шт",
          "progress": 60, // %
          "status": "available"
        }
      ]
    }
  ]
}
```

### 5.7 WebSocket Events

**Клиент → Сервер**

| Событие      | Данные       | Описание                     |
| ------------ | ------------ | ---------------------------- |
| `join:form`  | `{ formId }` | Подписка на обновления формы |
| `leave:form` | `{ formId }` | Отписка от обновлений        |
| `join:admin` | `{ token }`  | Подписка на админ-канал      |

**Сервер → Клиент**

| Событие              | Данные                                                    | Триггер                        |
| -------------------- | --------------------------------------------------------- | ------------------------------ |
| `item:statusChanged` | `{ itemId, currentQuantity, requiredQuantity, status }`   | Новая заявка                   |
| `section:filled`     | `{ sectionId, formId }`                                   | Все элементы раздела заполнены |
| `form:updated`       | `{ formId, action: 'published' / 'updated' / 'deleted' }` | Изменение формы                |
| `submission:new`     | `{ userName, itemLabels[] }`                              | Новая заявка (админ)           |
| `error`              | `{ message, code }`                                       | Ошибка                         |

---

## 6. План реализации

Оценка сложности каждого этапа по шкале 1–5 (1 — простой, 5 — очень сложный).

### Этап 1: DevOps — настройка инфраструктуры (сложность: 2)

| Шаг | Действие                      | Описание                                                                                                                            |
| --- | ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| 1.1 | Инициализация монорепозитория | Создать корневую структуру папок, `.gitignore`, корневой `README.md`                                                                |
| 1.2 | Настройка backend             | `npm init`, установить зависимости (express, mongoose, socket.io, cors, dotenv, bcrypt, jsonwebtoken, helmet, zod/joi)              |
| 1.3 | Настройка frontend            | `npm create vite@latest` с шаблоном React + TypeScript, установить зависимости (react-router-dom, socket.io-client, axios, zustand) |
| 1.4 | Docker                        | Написать `docker-compose.yml` (backend, frontend, mongodb, nginx), `Dockerfile` для backend и frontend                              |
| 1.5 | Переменные окружения          | Создать `.env.example` для backend и frontend                                                                                       |

### Этап 2: Backend — модели и база данных (сложность: 3)

| Шаг | Действие                         | Описание                                                                                              |
| --- | -------------------------------- | ----------------------------------------------------------------------------------------------------- |
| 2.1 | Подключение к MongoDB            | Настроить `config/db.ts` с Mongoose, обработку ошибок подключения                                     |
| 2.2 | Модель Admin                     | Схема с email, password (bcrypt), name, role. Пре-хук на хеширование пароля                           |
| 2.3 | Модель Form                      | Схема с name, slug (авто-генерация), description, isPublished, createdBy                              |
| 2.4 | Модель FormSection               | Схема с formId, name, description, order                                                              |
| 2.5 | Модель FormItem                  | Схема с sectionId, label, description, type, requiredQuantity, currentQuantity, unit, isActive, order |
| 2.6 | Модели Submission + SelectedItem | Схемы для хранения заявок и выбранных элементов                                                       |

### Этап 3: Backend — API и бизнес-логика (сложность: 4)

| Шаг | Действие              | Описание                                                            |
| --- | --------------------- | ------------------------------------------------------------------- |
| 3.1 | Auth модуль           | login, register, JWT middleware, защита роутов                      |
| 3.2 | Form Controller       | CRUD для форм, валидация slug, управление публикацией               |
| 3.3 | Section Controller    | CRUD для разделов, сортировка, каскадное удаление элементов         |
| 3.4 | Item Controller       | CRUD для элементов, атомарное обновление currentQuantity            |
| 3.5 | Submission Controller | Приём заявок, проверка лимитов, валидация одного элемента на раздел |
| 3.6 | Statistics Controller | Агрегация данных, подсчёт прогресса                                 |
| 3.7 | Валидация             | Middleware для валидации входных данных (zod/joi схемы)             |
| 3.8 | Обработка ошибок      | Глобальный error middleware, кастомные классы ошибок                |

### Этап 4: Backend — WebSocket (сложность: 3)

| Шаг | Действие           | Описание                                               |
| --- | ------------------ | ------------------------------------------------------ |
| 4.1 | Socket.io server   | Интеграция с Express, CORS для frontend                |
| 4.2 | Комнаты и подписки | Реализация join:form, leave:form, управление комнатами |
| 4.3 | События изменений  | Эмит itemStatusChanged при создании заявки             |
| 4.4 | Админ-канал        | Уведомления для администратора (новые заявки)          |

### Этап 5: Frontend — основа (сложность: 2)

| Шаг | Действие                      | Описание                                        |
| --- | ----------------------------- | ----------------------------------------------- |
| 5.1 | Настройка Vite + React Router | Роутинг: /admin/\*, /form/:slug, /login, 404    |
| 5.2 | API клиент                    | Axios instance с baseURL, перехватчик для JWT   |
| 5.3 | Auth на фронтенде             | Страница логина, хранение токена, защита роутов |
| 5.4 | Layout админ-панели           | Sidebar, Header, Main Content Area              |

### Этап 6: Frontend — конструктор форм (сложность: 4)

| Шаг | Действие             | Описание                                                  |
| --- | -------------------- | --------------------------------------------------------- |
| 6.1 | Страница списка форм | Таблица с формами, фильтрация, создание новой             |
| 6.2 | Редактор формы       | Редактирование названия, описания, публикация             |
| 6.3 | Редактор разделов    | Drag-and-drop сортировка, добавление/удаление             |
| 6.4 | Редактор элементов   | Форма создания/редактирования элемента, установка лимитов |
| 6.5 | Предпросмотр         | Визуализация заполненной формы                            |

### Этап 7: Frontend — публичная форма (сложность: 3)

| Шаг | Действие               | Описание                                              |
| --- | ---------------------- | ----------------------------------------------------- |
| 7.1 | Страница формы по slug | Загрузка и отображение опубликованной формы           |
| 7.2 | Выбор элементов        | UI с карточками элементов, ограничение один на раздел |
| 7.3 | Форма участника        | Поля: имя, фамилия, чекбокс согласия                  |
| 7.4 | Отправка и WebSocket   | Отправка заявки, real-time обновление статусов        |

### Этап 8: Frontend — статистика (сложность: 3)

| Шаг | Действие             | Описание                                           |
| --- | -------------------- | -------------------------------------------------- |
| 8.1 | Страница статистики  | Прогресс-бары, таблица элементов, общая информация |
| 8.2 | Список участников    | Таблица заявок с выбранными позициями              |
| 8.3 | Real-time обновление | Автоматическое обновление данных через WebSocket   |

### Этап 9: Финальная интеграция и тестирование (сложность: 3)

| Шаг | Действие                    | Описание                                                                       |
| --- | --------------------------- | ------------------------------------------------------------------------------ |
| 9.1 | Интеграционное тестирование | Проверка всех сценариев: создание формы → публикация → заполнение → статистика |
| 9.2 | Тестирование WebSocket      | Конкурентные заявки, real-time обновления                                      |
| 9.3 | Docker Compose              | Финальная проверка развёртывания                                               |
| 9.4 | Документация                | README с инструкцией по запуску                                                |

### Диаграмма зависимостей этапов

```
┌──────────┐
│  Этап 1  │  DevOps
│  Сложн:2 │
└────┬─────┘
     │
     ▼
┌──────────┐
│  Этап 2  │  Backend: Модели
│  Сложн:3 │
└────┬─────┘
     │
     ▼
┌──────────┐     ┌──────────┐
│  Этап 3  │────►│  Этап 4  │
│  API     │     │ WebSocket│
│  Сложн:4 │     │ Сложн:3  │
└────┬─────┘     └────┬─────┘
     │                │
     ▼                │
┌──────────┐          │
│  Этап 5  │◄─────────┘
│  Frontend│
│  Основа  │
│  Сложн:2 │
└────┬─────┘
     │
     ▼
┌──────────┐     ┌──────────┐     ┌──────────┐
│  Этап 6  │     │  Этап 7  │     │  Этап 8  │
│Конструкт.│     │Публичная │     │Статист.  │
│ Сложн:4  │     │ Сложн:3  │     │ Сложн:3  │
└────┬─────┘     └────┬─────┘     └────┬─────┘
     │                │                │
     ▼                ▼                ▼
┌──────────────────────────────────────────┐
│              Этап 9                       │
│     Финальная интеграция и тестирование   │
│              Сложн:3                      │
└──────────────────────────────────────────┘
```

---

## 7. Валидация и ограничения

### 7.1 Правила заполнения формы

| Правило                    | Описание                                                                           | Уровень            |
| -------------------------- | ---------------------------------------------------------------------------------- | ------------------ |
| **Один элемент на раздел** | Участник может выбрать только один элемент в каждом разделе                        | Backend + Frontend |
| **Лимит элемента**         | При `currentQuantity >= requiredQuantity` элемент блокируется                      | Backend + Frontend |
| **Обязательные поля**      | `userName` (2-100 символов), `userSurname` (2-100 символов), `consentGiven = true` | Backend + Frontend |
| **Согласие на ПД**         | Без `consentGiven: true` заявка отклоняется                                        | Backend            |
| **Уникальность раздела**   | Одна заявка — один `selectedItem` на `sectionId` (unique compound index)           | Backend (БД)       |
| **Минимум для публикации** | Форма должна содержать минимум 1 раздел и 1 элемент                                | Backend            |

### 7.2 Валидация на бэкенде

```typescript
// examples/validation.schemas.ts (концепт)

const createSubmissionSchema = z.object({
  userName: z.string().min(2).max(100),
  userSurname: z.string().min(2).max(100),
  consentGiven: z.literal(true, {
    errorMap: () => ({ message: "Необходимо дать согласие на обработку ПД" }),
  }),
  selectedItems: z
    .array(
      z.object({
        itemId: z.string().length(24),
        sectionId: z.string().length(24),
        quantity: z.number().int().min(1).default(1),
      }),
    )
    .min(1),
});
```

### 7.3 Логика блокировки элемента

```
Псевдокод проверки при заявке:

1. Для каждого selectedItem:
   a. Найти item по itemId
   b. Если item.currentQuantity + item.quantity > item.requiredQuantity → ОТКЛОНИТЬ (409)
   c. Проверить, нет ли уже заявки с таким sectionId в этой submission
      (уже гарантировано unique index)

2. Если все проверки пройдены:
   a. Создать Submission
   b. Для каждого selectedItem:
      - Создать SelectedItem
      - Атомарно: FormItem.findByIdAndUpdate(itemId, { $inc: { currentQuantity: quantity } })
   c. Эмит WebSocket события itemStatusChanged

3. Если любой элемент заблокирован → откатить всю транзакцию
   (использовать Mongoose sessions для атомарности)
```

### 7.4 Конкурентные заявки (Race Condition)

Для предотвращения состояния гонки при одновременных заявках:

1. **Атомарные операции:** Использовать `$inc` для обновления `currentQuantity`
2. **Optimistic locking:** Проверять `currentQuantity + запрашиваемое_количество <= requiredQuantity` перед обновлением
3. **Mongoose sessions:** В будущем можно использовать транзакции для атомарности нескольких операций

```typescript
// Пример атомарного обновления с проверкой
const result = await FormItem.findOneAndUpdate(
  {
    _id: itemId,
    $expr: {
      $lte: [{ $add: ["$currentQuantity", quantity] }, "$requiredQuantity"],
    },
  },
  { $inc: { currentQuantity: quantity } },
  { new: true },
);

if (!result) {
  throw new ConflictError("Элемент достиг лимита");
}
```

### 7.5 Валидация на фронтенде

| Поле              | Тип      | Ограничения                  |
| ----------------- | -------- | ---------------------------- |
| Название формы    | text     | max 200 символов             |
| Название раздела  | text     | max 200 символов             |
| Название элемента | text     | max 300 символов             |
| requiredQuantity  | number   | min 1, целое число           |
| userName          | text     | 2-100 символов, только буквы |
| userSurname       | text     | 2-100 символов, только буквы |
| consentGiven      | checkbox | обязателен true              |

### 7.6 Безопасность

| Мера                   | Описание                                           |
| ---------------------- | -------------------------------------------------- |
| **CORS**               | Настроен для frontend origin                       |
| **Helmet**             | HTTP заголовки безопасности                        |
| **Rate Limiting**      | express-rate-limit для публичных эндпоинтов        |
| **Input Sanitization** | Валидация всех входных данных через zod            |
| **JWT expiration**     | Токены с ограниченным сроком жизни                 |
| **bcrypt**             | Хеширование паролей (12 rounds)                    |
| **MongoDB Injection**  | Защита через Mongoose (нейтрализация $-операторов) |

---

## Приложение: Переменные окружения

### Backend `.env`

```bash
PORT=3001
MONGODB_URI=mongodb://mongodb:27017/formbuilder
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h
CORS_ORIGIN=http://localhost:5173
```

### Frontend `.env`

```bash
VITE_API_URL=http://localhost:3001/api
VITE_WS_URL=http://localhost:3001
```

---

## Приложение: docker-compose.yml

```yaml
version: "3.8"

services:
  mongodb:
    image: mongo:7
    container_name: formbuilder-mongodb
    restart: unless-stopped
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
    environment:
      MONGO_INITDB_DATABASE: formbuilder

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: formbuilder-backend
    restart: unless-stopped
    ports:
      - "3001:3001"
    environment:
      - PORT=3001
      - MONGODB_URI=mongodb://mongodb:27017/formbuilder
      - JWT_SECRET=${JWT_SECRET}
      - CORS_ORIGIN=http://localhost:5173
    depends_on:
      - mongodb

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: formbuilder-frontend
    restart: unless-stopped
    ports:
      - "5173:5173"
    environment:
      - VITE_API_URL=http://localhost:3001/api
      - VITE_WS_URL=http://localhost:3001
    depends_on:
      - backend

volumes:
  mongodb_data:
```

---

_Документ создан 08.06.2026. Версия 1.0._
