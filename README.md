# Конструктор форм

Full-stack приложение для создания и управления формами регистрации на мероприятия с real-time обновлениями.

## Архитектура

- **Frontend:** React 18 + TypeScript + Vite
- **Backend:** Node.js + Express + TypeScript
- **Database:** MongoDB 7 (Mongoose ODM)
- **Real-time:** Socket.io (WebSocket)
- **Контейнеризация:** Docker + Docker Compose

## Развёртывание

### 1. Клонирование репозитория

```bash
git clone <repository-url>
cd appCreateForm
```

### 2. Настройка .env файлов

Скопируйте примеры и отредактируйте при необходимости:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Отредактируйте `backend/.env` — обязательно измените `JWT_SECRET` на случайную строку.

### 3. Запуск через Docker Compose

```bash
docker-compose up --build
```

Эта команда запустит три сервиса:

- **MongoDB** — база данных
- **Backend** — API сервер на порту 5000
- **Frontend** — клиентское приложение на порту 3000

### 4. Создание первого администратора

После запуска выполните запрос для регистрации администратора:

```bash
curl -X POST http://localhost:5000/api/admin/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"securePass123","name":"Администратор"}'
```

### 5. Доступ к приложению

| Компонент    | URL                         |
| ------------ | --------------------------- |
| Админ-панель | http://localhost:3000/admin |
| API          | http://localhost:5000/api   |

## Разработка

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Переменные окружения

### Backend (`backend/.env`)

| Переменная       | Описание                     | Значение по умолчанию                 |
| ---------------- | ---------------------------- | ------------------------------------- |
| `PORT`           | Порт сервера                 | `5000`                                |
| `MONGODB_URI`    | Строка подключения к MongoDB | `mongodb://mongodb:27017/formbuilder` |
| `JWT_SECRET`     | Секретный ключ JWT           | _(обязательно изменить)_              |
| `JWT_EXPIRES_IN` | Срок действия токена         | `7d`                                  |
| `CORS_ORIGIN`    | Разрешённый origin           | `http://localhost:3000`               |

### Frontend (`frontend/.env`)

| Переменная     | Описание | Значение по умолчанию       |
| -------------- | -------- | --------------------------- |
| `VITE_API_URL` | URL API  | `http://localhost:5000/api` |
