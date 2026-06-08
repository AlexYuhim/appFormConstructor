import React from "react";
import { useNavigate } from "react-router-dom";
import { Result, Button } from "antd";

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Result
      status="404"
      title="404"
      subTitle="Страница не найдена"
      extra={
        <Button type="primary" onClick={() => navigate("/admin")}>
          На главную
        </Button>
      }
    />
  );
};

export default NotFoundPage;
