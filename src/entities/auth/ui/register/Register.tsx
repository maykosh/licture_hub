import { useState } from "react";
import {
  Form,
  Input,
  Button,
  Select,
  Typography,
  message,
} from "antd";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/entities/auth";
import { Role, signUp } from "@/shared";

const { Title } = Typography;

export const Register = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // const setAuth = useAuthStore((state) => state.setAuth);

  const onFinish = async (values: {name: string; email: string; password: string; role: Role}) => {
    const { name, email, password, role } = values;
    setLoading(true);
    try {
      const user = await signUp(email, password, name, role);

      if (!user) {
        throw new Error("Ошибка при создании пользователя");
      }

      // Вызов checkSession чтобы получить полные данные
      await useAuthStore.getState().checkSession();

      message.success("Вы успешно зарегистрировались!");
      navigate("/");
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      message.error( "Ошибка регистрации");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <div
        style={{
          flex: 1,
          backgroundImage: "url('/public/author.png')",
          backgroundSize: "cover",
        }}
      />

      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 40,
        }}
      >
        <div style={{ maxWidth: 400, width: "100%" }}>
          <Title level={2}>Регистрация</Title>

          <Form form={form} layout="vertical" onFinish={onFinish}>
            <Form.Item
              name="name"
              label="Имя"
              rules={[{ required: true, message: "Введите имя" }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, type: "email", message: "Введите email" },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="password"
              label="Пароль"
              rules={[
                { required: true, min: 6, message: "Минимум 6 символов" },
              ]}
            >
              <Input.Password />
            </Form.Item>

            <Form.Item
              name="role"
              label="Выберите роль"
              rules={[{ required: true, message: "Выберите роль" }]}
            >
              <Select placeholder="Роль">
                <Select.Option value="reader">Пользователь</Select.Option>
                <Select.Option value="author">Автор</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" block loading={loading}>
                Зарегистрироваться
              </Button>
            </Form.Item>

            <Form.Item>
              Уже есть аккаунт?{" "}
              <a onClick={() => navigate("/login")}>Войти</a>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
};
