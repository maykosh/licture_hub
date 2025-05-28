import { useState } from "react";
import { Form, Input, Button, Typography, message } from "antd";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/entities/auth";
import { signIn } from "@/shared";

const { Title } = Typography;

export const Login = () => {
   const [form] = Form.useForm();
   const [loading, setLoading] = useState(false);
   const navigate = useNavigate();
   const setAuth = useAuthStore((state) => state.setAuth);

   const onFinish = async (values: { email: string; password: string }) => {
      const { email, password } = values;
      setLoading(true);
      try {
         const user = await signIn(email, password);

         if (!user) {
            throw new Error("Неверные учетные данные");
         }

         // Сохраняем в Zustand
         const data = {
            uid: user.uid,
            name: user.name,
            role: user.role,
            token: user.token,
         };
         setAuth(data);

         message.success("Вы вошли в систему");

         // Редирект в зависимости от роли
         if (user.role === "author") {
            navigate("/author");
         } else if (user.role === "reader") {
            navigate("/reader");
         }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error: unknown) {
         message.error("Ошибка входа");
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
               <Title level={2}>Вход</Title>

               <Form form={form} layout="vertical" onFinish={onFinish}>
                  <Form.Item
                     name="email"
                     label="Email"
                     rules={[
                        { required: true, message: "Введите email" },
                        { type: "email", message: "Неверный email" },
                     ]}
                  >
                     <Input />
                  </Form.Item>

                  <Form.Item
                     name="password"
                     label="Пароль"
                     rules={[{ required: true, message: "Введите пароль" }]}
                  >
                     <Input.Password />
                  </Form.Item>

                  <Form.Item>
                     <Button
                        type="primary"
                        htmlType="submit"
                        block
                        loading={loading}
                     >
                        Войти
                     </Button>
                  </Form.Item>

                  <Form.Item>
                     Нет аккаунта?{" "}
                     <a onClick={() => navigate("/register")}>Регистрация</a>
                  </Form.Item>
               </Form>
            </div>
         </div>
      </div>
   );
};
