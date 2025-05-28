import React, { useState, useEffect } from "react";
import {
   Drawer,
   Form,
   Input,
   Upload,
   Button,
   message,
   Space,
   Select,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { supabase } from "@/shared";
import { fetchAuthorProfile } from "@/entities/author";
import { IAuthorProfile } from "@/entities/author/model/type";
import { v4 } from "uuid";
import { useAuthStore } from "@/entities/auth";

interface IProps {
   open: boolean;
   onClose: () => void;
   initialData: IAuthorProfile;
}

export const AuthorProfileEditor: React.FC<IProps> = ({
   open,
   onClose,
   initialData,
}) => {
   const [form] = Form.useForm();
   const [loading, setLoading] = useState(false);
   // Синхронизируем initialData с формой при открытии
   const userId = useAuthStore((state) => state.user?.uid);
   useEffect(() => {
      if (open) {
         form.setFieldsValue({
            name: initialData.author_name,
            bio: initialData.bio,
            achievements: initialData.achievements || [],
            avatar: initialData.avatar_url
               ? [
                    {
                       uid: "-1",
                       name: "avatar.png",
                       status: "done",
                       url: initialData.avatar_url || "",
                    },
                 ]
               : [],
         });
      }
   }, [open, initialData, form]);

   const handleFinish = async (values: any) => {
      setLoading(true);
      try {
         let avatarUrl = initialData.avatar_url;
         let avatarChanged = false;

         // Проверка: был ли загружен новый файл
         if (values.avatar[0].originFileObj) {
            const avatarFile = values.avatar[0].originFileObj;

            const fileExt = avatarFile.name.split(".").pop();
            const filePath = `${userId}/avatars/${v4()}.${fileExt}`;
            const { error: uploadError } = await supabase.storage
               .from("authors")
               .upload(filePath, avatarFile, {
                  upsert: true,
               });
            if (uploadError) throw uploadError;

            const {
               data: { publicUrl },
            } = supabase.storage.from("authors").getPublicUrl(filePath);
            avatarUrl = publicUrl;
            avatarChanged = true;
         }

         // Сравниваем значения
         const updatedFields: Partial<IAuthorProfile> = {};

         if (values.name !== initialData.author_name) {
            updatedFields.author_name = values.name;
         }

         if (values.bio !== initialData.bio) {
            updatedFields.bio = values.bio;
         }

         const achievementsChanged =
            JSON.stringify(values.achievements || []) !==
            JSON.stringify(initialData.achievements || []);
         if (achievementsChanged) {
            updatedFields.achievements = values.achievements;
         }

         if (avatarChanged) {
            updatedFields.avatar_url = avatarUrl;
         }

         // Если нет изменений — не делаем запрос
         if (Object.keys(updatedFields).length === 0) {
            message.info("Нет изменений для сохранения");
            setLoading(false);
            onClose();
            return;
         }

         const { error: updateError } = await supabase
            .from("authors")
            .update(updatedFields)
            .eq("id", userId);
         const { error: userNameUpdateError } = await supabase
            .from("users")
            .update({
               full_name: values.name,
               avatar_url: avatarUrl,
            })
            .eq("id", userId);
         if (updateError) throw updateError;
         if (userNameUpdateError) throw userNameUpdateError;
         fetchAuthorProfile(userId!);

         message.success("Профиль обновлён");
         onClose();
      } catch (error: unknown) {
         console.error(error);
         message.error("Ошибка при обновлении профиля");
      } finally {
         setLoading(false);
      }
   };

   return (
      <Drawer
         title="Редактировать профиль"
         width={480}
         onClose={onClose}
         open={open}
         footer={
            <Space style={{ display: "flex", justifyContent: "end" }}>
               <Button onClick={onClose}>Отмена</Button>
               <Button
                  type="primary"
                  onClick={() => form.submit()}
                  loading={loading}
               >
                  Сохранить
               </Button>
            </Space>
         }
      >
         <Form layout="vertical" form={form} onFinish={handleFinish}>
            <Form.Item name="name" label="Имя" rules={[{ required: true }]}>
               <Input />
            </Form.Item>

            <Form.Item name="bio" label="Биография">
               <Input.TextArea rows={4} />
            </Form.Item>

            <Form.Item name="achievements" label="Достижения">
               <Select
                  mode="tags"
                  placeholder="Добавьте достижения по одному"
                  style={{ width: "100%" }}
               />
            </Form.Item>

            <Form.Item
               name="avatar"
               label="Фото профиля"
               valuePropName="fileList"
               getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
            >
               <Upload
                  beforeUpload={() => false}
                  maxCount={1}
                  listType="picture"
               >
                  <Button icon={<UploadOutlined />}>
                     Загрузить изображение
                  </Button>
               </Upload>
            </Form.Item>
         </Form>
      </Drawer>
   );
};
