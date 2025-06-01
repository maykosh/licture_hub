import React, { useState, useEffect } from "react";
import {
   Card,
   Avatar,
   Upload,
   Button,
   Input,
   Space,
   Typography,
   message,
   Divider,
   Row,
   Col,
   Skeleton,
} from "antd";
import {
   UserOutlined,
   EditOutlined,
   SaveOutlined,
   CameraOutlined,
} from "@ant-design/icons";
import { supabase } from "@/shared/supabase/supabaseClient";
import { useAuthStore } from "@/entities/auth";
import type { UploadProps } from "antd";
import { motion, AnimatePresence } from "framer-motion";
import { v4 } from "uuid";

const { Title, Text, Paragraph } = Typography;

export const ProfileSettings: React.FC = () => {
   const { user } = useAuthStore();
   const [fullName, setFullName] = useState("");
   const [email, setEmail] = useState("");
   const [avatarUrl, setAvatarUrl] = useState("");
   const [loading, setLoading] = useState(false);
   const [isEditing, setIsEditing] = useState(false);

   useEffect(() => {
      if (user) {
         fetchUserData();
      }
   }, [user]);

   const fetchUserData = async () => {
      if (!user) return;

      try {
         setLoading(true);
         const { data, error } = await supabase
            .from("users")
            .select("*")
            .eq("id", user.uid)
            .single();

         if (error) throw error;

         if (data) {
            setFullName(data.full_name || "");
            setEmail(data.email || "");
            setAvatarUrl(data.avatar_url || "");
         }
      } catch (error) {
         console.error("Ошибка при загрузке данных пользователя:", error);
         message.error("Не удалось загрузить данные профиля");
      } finally {
         setLoading(false);
      }
   };

   const handleSave = async () => {
      if (!user) return;

      try {
         setLoading(true);

         // Если аватар был изменен, обновляем его в storage
         if (avatarUrl !== user.avatar_url) {
            const { error: updateAvatarError } = await supabase
               .from("users")
               .update({
                  full_name: fullName,
                  avatar_url: avatarUrl,
               })
               .eq("id", user.uid);

            if (updateAvatarError) throw updateAvatarError;

            // Обновляем данные в auth store
            useAuthStore.setState((state) => ({
               user: {
                  ...state.user!,
                  avatar_url: avatarUrl,
                  full_name: fullName,
               },
            }));
         } else {
            // Если аватар не менялся, обновляем только имя
            const { error } = await supabase
               .from("users")
               .update({
                  full_name: fullName,
               })
               .eq("id", user.uid);

            if (error) throw error;

            // Обновляем только имя в auth store
            useAuthStore.setState((state) => ({
               user: {
                  ...state.user!,
                  full_name: fullName,
               },
            }));
         }

         message.success("Профиль успешно обновлен");
         setIsEditing(false);
      } catch (error) {
         console.error("Ошибка при обновлении профиля:", error);
         message.error("Не удалось обновить профиль");
      } finally {
         setLoading(false);
      }
   };

   const uploadAvatar = async (file: File) => {
      if (!user) return;

      try {
         setLoading(true);
         const fileExt = file.name.split(".").pop();
         const fileName = `${user.uid}-${v4()}.${fileExt}`;
         const filePath = `${user.uid}/avatar/${fileName}`;

         // Загружаем файл
         const { error: uploadError } = await supabase.storage
            .from("user")
            .upload(filePath, file);

         if (uploadError) throw uploadError;

         // Получаем публичный URL
         const {
            data: { publicUrl },
         } = supabase.storage.from("user").getPublicUrl(filePath);

         // Обновляем URL в базе данных
         const { error: updateError } = await supabase
            .from("users")
            .update({
               avatar_url: publicUrl,
               updated_at: new Date().toISOString(),
            })
            .eq("id", user.uid);

         if (updateError) throw updateError;

         // Получаем обновленные данные пользователя
         const { data: updatedUser, error: fetchError } = await supabase
            .from("users")
            .select("*")
            .eq("id", user.uid)
            .single();

         if (fetchError) throw fetchError;

         // Обновляем локальное состояние
         setAvatarUrl(publicUrl);

         // Обновляем глобальное состояние
         useAuthStore.setState((state) => ({
            user: {
               ...state.user!,
               avatar_url: publicUrl,
               ...updatedUser,
            },
         }));

         message.success("Аватар успешно обновлен");
      } catch (error) {
         console.error("Ошибка при загрузке аватара:", error);
         message.error("Не удалось загрузить аватар");
      } finally {
         setLoading(false);
      }
   };

   const uploadProps: UploadProps = {
      name: "avatar",
      showUploadList: false,
      beforeUpload: (file) => {
         const isImage = file.type.startsWith("image/");
         if (!isImage) {
            message.error("Можно загружать только изображения!");
            return false;
         }
         const isLt2M = file.size / 1024 / 1024 < 2;
         if (!isLt2M) {
            message.error("Размер изображения не должен превышать 2MB!");
            return false;
         }
         uploadAvatar(file);
         return false;
      },
   };

   return (
      <motion.div
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ duration: 0.5 }}
         style={{ padding: "24px", maxWidth: 800, margin: "0 auto" }}
      >
         <Card
            bordered={false}
            style={{
               borderRadius: "16px",
               boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
            }}
         >
            <Skeleton loading={loading} avatar active>
               <Row gutter={[24, 24]} align="middle">
                  <Col xs={24} sm={8}>
                     <div style={{ textAlign: "center" }}>
                        <div
                           style={{
                              position: "relative",
                              display: "inline-block",
                           }}
                        >
                           <Avatar
                              size={120}
                              src={avatarUrl}
                              icon={<UserOutlined />}
                              style={{
                                 border: "4px solid white",
                                 boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                              }}
                           />
                           <Upload {...uploadProps}>
                              <Button
                                 type="primary"
                                 shape="circle"
                                 icon={<CameraOutlined />}
                                 size="small"
                                 style={{
                                    position: "absolute",
                                    bottom: 0,
                                    right: 0,
                                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                                 }}
                              />
                           </Upload>
                        </div>
                     </div>
                  </Col>
                  <Col xs={24} sm={16}>
                     <Space
                        direction="vertical"
                        size="large"
                        style={{ width: "100%" }}
                     >
                        <div>
                           <Title level={4} style={{ marginBottom: 24 }}>
                              Личные данные
                           </Title>
                           <Space
                              direction="vertical"
                              size="middle"
                              style={{ width: "100%" }}
                           >
                              <div>
                                 <Text type="secondary">Email</Text>
                                 <Paragraph style={{ marginTop: 4 }}>
                                    {email}
                                 </Paragraph>
                              </div>
                              <div>
                                 <Text type="secondary">Имя пользователя</Text>
                                 <AnimatePresence mode="wait">
                                    {isEditing ? (
                                       <motion.div
                                          initial={{ opacity: 0 }}
                                          animate={{ opacity: 1 }}
                                          exit={{ opacity: 0 }}
                                       >
                                          <Input
                                             value={fullName}
                                             onChange={(e) =>
                                                setFullName(e.target.value)
                                             }
                                             placeholder="Введите ваше имя"
                                             style={{ marginTop: 4 }}
                                          />
                                       </motion.div>
                                    ) : (
                                       <motion.div
                                          initial={{ opacity: 0 }}
                                          animate={{ opacity: 1 }}
                                          exit={{ opacity: 0 }}
                                       >
                                          <Paragraph style={{ marginTop: 4 }}>
                                             {fullName || "Не указано"}
                                          </Paragraph>
                                       </motion.div>
                                    )}
                                 </AnimatePresence>
                              </div>
                           </Space>
                        </div>
                        <Divider style={{ margin: "12px 0" }} />
                        <Space>
                           {isEditing ? (
                              <>
                                 <Button
                                    type="primary"
                                    icon={<SaveOutlined />}
                                    onClick={handleSave}
                                    loading={loading}
                                 >
                                    Сохранить
                                 </Button>
                                 <Button onClick={() => setIsEditing(false)}>
                                    Отмена
                                 </Button>
                              </>
                           ) : (
                              <Button
                                 icon={<EditOutlined />}
                                 onClick={() => setIsEditing(true)}
                              >
                                 Редактировать
                              </Button>
                           )}
                        </Space>
                     </Space>
                  </Col>
               </Row>
            </Skeleton>
         </Card>
      </motion.div>
   );
};
