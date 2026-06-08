import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "./components/layout/AdminLayout";
import LoginPage from "./pages/admin/LoginPage";
import RegisterPage from "./pages/admin/RegisterPage";
import DashboardPage from "./pages/admin/DashboardPage";
import FormListPage from "./pages/admin/FormListPage";
import FormEditorPage from "./pages/admin/FormEditorPage";
import FormStatisticsPage from "./pages/admin/FormStatisticsPage";
import NotFoundPage from "./pages/admin/NotFoundPage";
import PublicFormPage from "./pages/public/PublicFormPage";

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/admin" replace />} />
      <Route path="/admin/login" element={<LoginPage />} />
      <Route path="/admin/register" element={<RegisterPage />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="forms" element={<FormListPage />} />
        <Route path="forms/new" element={<FormEditorPage />} />
        <Route path="forms/:id/edit" element={<FormEditorPage />} />
        <Route path="forms/:id/statistics" element={<FormStatisticsPage />} />
      </Route>
      <Route path="/form/:slug" element={<PublicFormPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default App;
