import React, { useState, useEffect } from "react";
import { Drawer, Form, Input, Button, message, Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { IPosts } from "@/entities/author/model/type";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "@/shared";
import ReactQuill from "react-quill";

interface EditPostDrawerProps {
   open: boolean;
   onClose: () => void;
   post: IPosts | null;
   onUpdate: (values: IPosts) => void;
}

interface FormValues {
   title: string;
   content: string;
   poster_url?: string;
}

export const EditPostDrawer: React.FC<EditPostDrawerProps> = ({
   open,
   onClose,
   post,
   onUpdate,
}) => {
   const [form] = Form.useForm();
   const [uploading, setUploading] = useState(false);
   const [imageUrl, setImageUrl] = useState<string | null>(null);

   useEffect(() => {
      if (post) {
         form.setFieldsValue(post);
         setImageUrl(post.poster_url || null);
      } else {
         form.resetFields();
         setImageUrl(null);
      }
   }, [post, form]);

   const handleUpload = async (file: File) => {
      setUploading(true);
      const filePath = `${post?.author_id}/posters/${uuidv4()}.${file.name}`;
      const { error } = await supabase.storage
         .from("posts")
         .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
         });

      if (error) {
         message.error("Ошибка загрузки изображения");
         setUploading(false);
         return;
      }

      const { data } = supabase.storage.from("posts").getPublicUrl(filePath);
      setImageUrl(data.publicUrl);
      form.setFieldValue("poster_url", data.publicUrl);
      setUploading(false);
   };

   const beforeUpload = (file: File) => {
      const isImage = file.type.startsWith("image/");
      if (!isImage) {
         message.error("Можно загружать только изображения!");
         return Upload.LIST_IGNORE;
      }
      handleUpload(file);
      return false;
   };

   const handleSubmit = async (values: FormValues) => {
      try {
         const updatedValues = {
            ...post,
            ...values,
            poster_url: imageUrl,
         };

         const hasChanges =
            Object.keys(values).some((key) => {
               const typedKey = key as keyof FormValues;
               return values[typedKey] !== (post as IPosts)[typedKey];
            }) || imageUrl !== post?.poster_url;

         if (!hasChanges) {
            message.info("Изменений не обнаружено");
            onClose();
            return;
         }

         onUpdate(updatedValues as IPosts);
         message.success("Пост обновлён!");
         onClose();
      } catch (error) {
         console.error("Ошибка при обновлении:", error);
         message.error("Ошибка при обновлении");
      }
   };

   return (
      <Drawer
         title="Редактировать пост"
         open={open}
         onClose={onClose}
         width={600}
         destroyOnClose
      >
         <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            style={{ height: "100%" }}
         >
            <Form.Item
               name="title"
               label="Заголовок"
               rules={[{ required: true, message: "Введите заголовок" }]}
            >
               <Input />
            </Form.Item>

            <Form.Item
               name="content"
               label="Контент"
               rules={[{ required: true, message: "Введите контент" }]}
            >
               <ReactQuill theme="snow" />
            </Form.Item>

            <Form.Item label="Постер">
               {imageUrl && (
                  <img
                     src={imageUrl}
                     alt="постер"
                     style={{
                        width: "100%",
                        maxHeight: 200,
                        objectFit: "cover",
                        marginBottom: 10,
                     }}
                  />
               )}
               <Upload
                  showUploadList={false}
                  beforeUpload={beforeUpload}
                  accept="image/*"
               >
                  <Button icon={<UploadOutlined />} loading={uploading}>
                     {uploading ? "Загрузка..." : "Загрузить изображение"}
                  </Button>
               </Upload>
            </Form.Item>

            <Form.Item name="poster_url" hidden>
               <Input />
            </Form.Item>

            <Form.Item style={{ marginTop: "auto" }}>
               <Button
                  type="primary"
                  htmlType="submit"
                  loading={uploading}
                  block
               >
                  Сохранить изменения
               </Button>
            </Form.Item>
         </Form>
      </Drawer>
   );
};
