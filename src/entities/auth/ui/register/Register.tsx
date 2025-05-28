import { useState } from "react";
import { Form, Input, Button, Select, Typography, message, Space } from "antd";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/entities/auth";
import { Role, signUp } from "@/shared";
import {
   UserOutlined,
   LockOutlined,
   MailOutlined,
   UserSwitchOutlined,
   UserAddOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";

const { Title, Text } = Typography;

export const Register = () => {
   const [form] = Form.useForm();
   const navigate = useNavigate();
   const [loading, setLoading] = useState(false);

   // const setAuth = useAuthStore((state) => state.setAuth);

   const onFinish = async (values: {
      name: string;
      email: string;
      password: string;
      role: Role;
   }) => {
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
         message.error("Ошибка регистрации");
      } finally {
         setLoading(false);
      }
   };

   return (
      <div
         style={{
            display: "flex",
            minHeight: "100vh",
            background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
         }}
      >
         <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            style={{
               flex: 1,
               backgroundImage:
                  "url('https://cdn1.img.sputniknews.uz/img/07e8/07/11/44832225_0:0:1024:577_1920x0_80_0_0_117a3df8b82b2267d60c2f9a14b568c1.jpg')",
               backgroundSize: "cover",
               backgroundPosition: "center",
               position: "relative",
               borderRadius: "0 20px 20px 0",
               boxShadow: "10px 0 20px rgba(0,0,0,0.1)",
               overflow: "hidden",
            }}
         >
            <div
               style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: "rgba(0,0,0,0.4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 40,
               }}
            >
               <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
               >
                  <Title
                     level={1}
                     style={{
                        color: "white",
                        marginBottom: 20,
                        textAlign: "center",
                     }}
                  >
                     Создайте аккаунт
                  </Title>
                  <Text
                     style={{
                        color: "rgba(255,255,255,0.8)",
                        fontSize: "1.1rem",
                        textAlign: "center",
                        display: "block",
                     }}
                  >
                     Присоединяйтесь к нашему сообществу авторов и читателей
                  </Text>
               </motion.div>
            </div>
         </motion.div>

         <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            style={{
               flex: 1,
               display: "flex",
               alignItems: "center",
               justifyContent: "center",
               padding: 40,
            }}
         >
            <div style={{ maxWidth: 400, width: "100%" }}>
               <Space
                  direction="vertical"
                  size="large"
                  style={{ width: "100%", marginBottom: 40 }}
               >
                  <Title level={2} style={{ margin: 0 }}>
                     Регистрация
                  </Title>
                  <Text type="secondary">
                     Заполните форму для создания аккаунта
                  </Text>
               </Space>

               <Form
                  form={form}
                  layout="vertical"
                  onFinish={onFinish}
                  size="large"
               >
                  <Form.Item
                     name="name"
                     rules={[{ required: true, message: "Введите имя" }]}
                  >
                     <Input
                        prefix={<UserOutlined style={{ color: "#bfbfbf" }} />}
                        placeholder="Ваше имя"
                        style={{ borderRadius: 8 }}
                     />
                  </Form.Item>

                  <Form.Item
                     name="email"
                     rules={[
                        {
                           required: true,
                           type: "email",
                           message: "Введите корректный email",
                        },
                     ]}
                  >
                     <Input
                        prefix={<MailOutlined style={{ color: "#bfbfbf" }} />}
                        placeholder="Email"
                        style={{ borderRadius: 8 }}
                     />
                  </Form.Item>

                  <Form.Item
                     name="password"
                     rules={[
                        {
                           required: true,
                           min: 6,
                           message: "Минимум 6 символов",
                        },
                     ]}
                  >
                     <Input.Password
                        prefix={<LockOutlined style={{ color: "#bfbfbf" }} />}
                        placeholder="Пароль"
                        style={{ borderRadius: 8 }}
                     />
                  </Form.Item>

                  <Form.Item
                     name="role"
                     rules={[{ required: true, message: "Выберите роль" }]}
                  >
                     <Select
                        placeholder="Выберите роль"
                        style={{ borderRadius: 8 }}
                        suffixIcon={
                           <UserSwitchOutlined style={{ color: "#bfbfbf" }} />
                        }
                     >
                        <Select.Option value="reader">
                           Пользователь
                        </Select.Option>
                        <Select.Option value="author">Автор</Select.Option>
                     </Select>
                  </Form.Item>

                  <Form.Item>
                     <Button
                        type="primary"
                        htmlType="submit"
                        block
                        loading={loading}
                        icon={<UserAddOutlined />}
                        style={{
                           height: 45,
                           borderRadius: 8,
                           fontSize: "1.1rem",
                           boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        }}
                     >
                        Зарегистрироваться
                     </Button>
                  </Form.Item>

                  <Form.Item style={{ marginBottom: 0, textAlign: "center" }}>
                     <Text type="secondary">
                        Уже есть аккаунт?{" "}
                        <Button
                           type="link"
                           onClick={() => navigate("/login")}
                           style={{ padding: 0, fontSize: "inherit" }}
                        >
                           Войти
                        </Button>
                     </Text>
                  </Form.Item>
               </Form>
            </div>
         </motion.div>
      </div>
   );
};
