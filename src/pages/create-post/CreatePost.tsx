import React, { useState } from "react";
import { Button, Input, message, Switch, Upload, Card, Typography } from "antd";
import ReactQuill from "react-quill";
import { UploadOutlined } from "@ant-design/icons";
import "react-quill/dist/quill.snow.css";
import { supabase } from "@/shared";
import { v4 as uuidv4 } from "uuid";
import { useAuthStore } from "@/entities/auth";
import { useAuthorProfileStore } from "@/entities/author";
import type { UploadFile } from "antd/es/upload/interface";

const { Title } = Typography;

export const CreatePost: React.FC = () => {
   const [title, setTitle] = useState("");
   const [content, setContent] = useState("");
   const [isPaid, setIsPaid] = useState(false);
   const [poster, setPoster] = useState<UploadFile[]>([]);
   const [loading, setLoading] = useState(false);

   const { user } = useAuthStore((state) => state);
   const { setPosts } = useAuthorProfileStore((state) => state);
   const userId = user?.uid;

   const handleCreate = async () => {
      if (!title || !content) {
         return message.warning("Заполните все поля");
      }

      if (!userId) {
         return message.error("Пользователь не найден");
      }

      setLoading(true);
      try {
         let posterUrl = null;

         // Загрузка изображения постера
         if (poster.length > 0 && poster[0].originFileObj) {
            const file = poster[0].originFileObj;
            const fileExt = file.name.split(".").pop();
            const filePath = `${userId}/posters/${uuidv4()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
               .from("posts")
               .upload(filePath, file, {
                  upsert: true,
               });

            if (uploadError) throw uploadError;

            const {
               data: { publicUrl },
            } = supabase.storage.from("posts").getPublicUrl(filePath);

            posterUrl = publicUrl;
         }

         const { error } = await supabase.from("posts").insert({
            author_id: userId,
            title,
            content,
            is_paid: isPaid,
            poster_url: posterUrl,
         });

         if (error) throw error;
         const { data } = await supabase.from("posts").select("*").single();
         setPosts(data);
         message.success("Пост успешно создан");

         // Сброс
         setTitle("");
         setContent("");
         setIsPaid(false);
         setPoster([]);
      } catch (err: any) {
         console.error(err);
         message.error("Ошибка при создании поста");
      } finally {
         setLoading(false);
      }
   };

   return (
      <div className="max-w-4xl mx-auto p-6">
         <Card className="shadow-lg rounded-lg">
            <Title level={2} className="mb-6 text-center">
               Создать новый пост
            </Title>

            <div className="space-y-6">
               <div>
                  <Input
                     placeholder="Введите заголовок поста"
                     value={title}
                     onChange={(e) => setTitle(e.target.value)}
                     size="large"
                     className="rounded-lg"
                  />
               </div>

               <div className="h-[400px] border rounded-lg overflow-hidden">
                  <ReactQuill
                     value={content}
                     onChange={setContent}
                     style={{ height: 350 }}
                     theme="snow"
                     placeholder="Начните писать ваш пост здесь..."
                  />
               </div>

               <div className="flex flex-wrap items-center gap-6 justify-between bg-gray-50 p-4 rounded-lg">
                  <Upload
                     beforeUpload={() => false}
                     maxCount={1}
                     listType="picture"
                     fileList={poster}
                     onChange={({ fileList }) => setPoster(fileList)}
                     className="flex-shrink-0"
                  >
                     <Button icon={<UploadOutlined />} size="large">
                        Загрузить постер
                     </Button>
                  </Upload>

                  <div className="flex items-center gap-3">
                     <span className="text-gray-600">Платный пост</span>
                     <Switch
                        checked={isPaid}
                        onChange={setIsPaid}
                        className="bg-gray-300"
                     />
                  </div>

                  <Button
                     type="primary"
                     onClick={handleCreate}
                     loading={loading}
                     size="large"
                     className="bg-blue-500 hover:bg-blue-600"
                  >
                     {loading ? "Публикация..." : "Опубликовать"}
                  </Button>
               </div>
            </div>
         </Card>
      </div>
   );
};
