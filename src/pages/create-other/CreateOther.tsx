import React, { useState } from "react";
import {
   Form,
   Input,
   Button,
   Upload,
   Select,
   Switch,
   message,
   Typography,
   Card,
   Flex,
   Spin,
   InputNumber,
} from "antd";
import {
   UploadOutlined,
   FileTextOutlined,
   VideoCameraOutlined,
   BookOutlined,
   DollarOutlined,
} from "@ant-design/icons";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "@/shared";
import { RcFile } from "antd/lib/upload";
import { useAuthStore } from "@/entities/auth";
import styles from "./CreateOther.module.css";

interface MediaFormValues {
   title: string;
   description: string;
   cover_url?: string;
   youtube_url?: string;
   url?: string;
   price?: number;
   is_paid?: boolean;
   media_type: "video" | "book";
}

const { TextArea } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

export const MediaUploader: React.FC = () => {
   const [form] = Form.useForm<MediaFormValues>();
   const [type, setType] = useState<"book" | "video">("book");
   const [uploading, setUploading] = useState(false);
   const [uploadingCover, setUploadingCover] = useState(false);
   const [coverUrl, setCoverUrl] = useState<string | null>(null);
   const [fileUrl, setFileUrl] = useState<string | null>(null);
   const userId = useAuthStore((state) => state.user?.uid);

   const handleCoverUpload = async (file: RcFile) => {
      if (!userId) {
         message.error("Ошибка: Не найден ID автора");
         return false;
      }

      const isImage = file.type.startsWith("image/");
      if (!isImage) {
         message.error("Можно загружать только изображения!");
         return false;
      }

      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
         message.error("Размер изображения должен быть меньше 5MB!");
         return false;
      }

      setUploadingCover(true);

      try {
         const fileExt = file.name.split(".").pop();
         const filePath = `${userId}/covers/${uuidv4()}.${fileExt}`;

         const { error: uploadError } = await supabase.storage
            .from("media")
            .upload(filePath, file, {
               cacheControl: "3600",
               upsert: true,
            });

         if (uploadError) {
            throw uploadError;
         }

         const { data } = supabase.storage.from("media").getPublicUrl(filePath);
         setCoverUrl(data.publicUrl);
         form.setFieldValue("cover_url", data.publicUrl);
         message.success("Обложка успешно загружена!");
      } catch (error) {
         console.error("Ошибка загрузки обложки:", error);
         message.error("Ошибка загрузки обложки");
      } finally {
         setUploadingCover(false);
      }

      return false;
   };

   const handleBookFileUpload = async (file: File) => {
      if (!userId) {
         message.error("Ошибка: Не найден ID автора");
         return;
      }

      setUploading(true);
      const sanitizeFileName = (name: string) => {
         return name.replace(/\s+/g, "_").replace(/[^\w.-]/gi, "");
      };

      try {
         const originalName = file.name;
         const sanitizedFileName = sanitizeFileName(originalName);
         const filePath = `${userId}/files/${uuidv4()}-${sanitizedFileName}`;

         const { error } = await supabase.storage
            .from("books")
            .upload(filePath, file);

         if (error) {
            console.error("Ошибка загрузки файла книги:", error);
            message.error("Ошибка загрузки файла книги");
            setUploading(false);
            return;
         }

         const { data } = supabase.storage.from("books").getPublicUrl(filePath);
         setFileUrl(data.publicUrl);
         form.setFieldValue("url", data.publicUrl);
      } catch (error) {
         console.error("Ошибка загрузки файла книги:", error);
         message.error("Ошибка загрузки файла книги");
      } finally {
         setUploading(false);
      }
   };

   const handleFinish = async (values: MediaFormValues) => {
      const { title, description, is_paid, price } = values;
      if (!userId) {
         message.error("Ошибка: Не найден ID автора");
         return;
      }

      try {
         if (type === "book" && !fileUrl) {
            message.error("Загрузите файл книги");
            return;
         }

         if (type === "book") {
            const bookData = {
               title,
               description,
               author_id: userId,
               cover_url: coverUrl || "",
               file_url: fileUrl,
               price: is_paid ? price : 0,
               is_paid: is_paid || false,
            };

            const { error: submitError } = await supabase
               .from("books")
               .insert([bookData]);

            if (submitError) throw submitError;
         } else {
            const mediaData = {
               title,
               description,
               author_id: userId,
               cover_url: coverUrl || "",
               youtube_url: values.youtube_url,
               media_type: "video",
               price: is_paid ? price : 0,
               is_paid: is_paid || false,
            };

            const { error: submitError } = await supabase
               .from("media")
               .insert([mediaData]);

            if (submitError) throw submitError;
         }

         message.success(
            `${type === "book" ? "Книга" : "Видео"} добавлено успешно!`
         );
         form.resetFields();
         setCoverUrl(null);
         setFileUrl(null);
      } catch (error: unknown) {
         console.error(
            `Ошибка при добавлении ${type === "book" ? "книги" : "видео"}:`,
            error
         );
         message.error(
            `Ошибка при добавлении ${type === "book" ? "книги" : "видео"}`
         );
      }
   };

   return (
      <div className={styles.container}>
         <Card className={styles.card} bordered={false}>
            <Title level={2} className={styles.title}>
               Добавить {type === "book" ? "книгу" : "видео"}
            </Title>

            <Form
               layout="vertical"
               form={form}
               onFinish={handleFinish}
               className={styles.form}
               initialValues={{ media_type: "book" }}
            >
               <div className={styles.typeSelector}>
                  <Form.Item label="Тип медиа" name="media_type">
                     <Select
                        onChange={(val) => setType(val)}
                        className={styles.select}
                     >
                        <Option value="book">
                           <Flex align="center" gap={8}>
                              <BookOutlined />
                              <span>Книга</span>
                           </Flex>
                        </Option>
                        <Option value="video">
                           <Flex align="center" gap={8}>
                              <VideoCameraOutlined />
                              <span>Видео (YouTube)</span>
                           </Flex>
                        </Option>
                     </Select>
                  </Form.Item>
               </div>

               <Form.Item
                  label="Название"
                  name="title"
                  rules={[{ required: true, message: "Введите название" }]}
               >
                  <Input
                     placeholder="Название книги или видео"
                     className={styles.input}
                     size="large"
                  />
               </Form.Item>

               <Form.Item
                  label="Описание"
                  name="description"
                  rules={[{ required: true, message: "Введите описание" }]}
               >
                  <TextArea
                     rows={4}
                     placeholder="Описание..."
                     className={styles.textarea}
                     size="large"
                  />
               </Form.Item>

               <Form.Item label="Обложка" className={styles.uploadSection}>
                  <Upload
                     beforeUpload={handleCoverUpload}
                     showUploadList={false}
                     accept="image/*"
                     className={styles.uploader}
                     disabled={uploadingCover}
                  >
                     <div className={styles.uploadArea}>
                        {uploadingCover ? (
                           <div className={styles.placeholder}>
                              <UploadOutlined className={styles.uploadIcon} />
                              <Spin tip="Загрузка..." />
                              <Text>Нажмите или перетащите файл</Text>
                              <Text type="secondary" className={styles.hint}>
                                 PNG, JPG до 5MB
                              </Text>
                           </div>
                        ) : coverUrl ? (
                           <div className={styles.previewContainer}>
                              <img
                                 src={coverUrl}
                                 alt="Обложка"
                                 className={styles.preview}
                              />
                              <div className={styles.overlay}>
                                 <Button icon={<UploadOutlined />}>
                                    Изменить
                                 </Button>
                              </div>
                           </div>
                        ) : (
                           <div className={styles.placeholder}>
                              <UploadOutlined className={styles.uploadIcon} />
                              <Text>Нажмите или перетащите файл</Text>
                              <Text type="secondary" className={styles.hint}>
                                 PNG, JPG до 5MB
                              </Text>
                           </div>
                        )}
                     </div>
                  </Upload>
               </Form.Item>

               {type === "book" ? (
                  <>
                     <Form.Item
                        label="Файл книги"
                        className={styles.uploadSection}
                     >
                        <Upload
                           beforeUpload={(file) => {
                              handleBookFileUpload(file);
                              return false;
                           }}
                           showUploadList={false}
                           accept=".pdf,.epub"
                           className={styles.uploader}
                        >
                           <div className={styles.uploadArea}>
                              {fileUrl ? (
                                 <div className={styles.fileUploaded}>
                                    <FileTextOutlined
                                       className={styles.fileIcon}
                                    />
                                    <Text strong>Файл загружен</Text>
                                    <Button
                                       icon={<UploadOutlined />}
                                       className={styles.replaceButton}
                                    >
                                       Заменить файл
                                    </Button>
                                 </div>
                              ) : (
                                 <div className={styles.placeholder}>
                                    <FileTextOutlined
                                       className={styles.uploadIcon}
                                    />
                                    <Button
                                       icon={<UploadOutlined />}
                                       loading={uploading}
                                       size="large"
                                    >
                                       {uploading
                                          ? "Загрузка..."
                                          : "Загрузить файл"}
                                    </Button>
                                    <Text
                                       type="secondary"
                                       className={styles.hint}
                                    >
                                       PDF, EPUB до 50MB
                                    </Text>
                                 </div>
                              )}
                           </div>
                        </Upload>
                     </Form.Item>

                     <div className={styles.priceSection}>
                        <Form.Item
                           name="is_paid"
                           valuePropName="checked"
                           className={styles.switchContainer}
                        >
                           <Flex align="center" gap={8}>
                              <DollarOutlined className={styles.priceIcon} />
                              <span>Платный контент</span>
                              <Switch
                                 onChange={(checked) =>
                                    form.setFieldsValue({ is_paid: checked })
                                 }
                              />
                           </Flex>
                        </Form.Item>

                        <Form.Item
                           noStyle
                           shouldUpdate={(prevValues, currentValues) =>
                              prevValues.is_paid !== currentValues.is_paid
                           }
                        >
                           {({ getFieldValue }) => {
                              const isPaid = getFieldValue("is_paid");
                              return isPaid ? (
                                 <Form.Item
                                    name="price"
                                    className={styles.priceInput}
                                    rules={[
                                       {
                                          required: true,
                                          message: "Введите цену",
                                       },
                                       {
                                          type: "number",
                                          min: 0.01,
                                          message: "Цена должна быть больше 0",
                                       },
                                    ]}
                                 >
                                    <InputNumber
                                       placeholder="0.00"
                                       className={styles.input}
                                       size="large"
                                       step="0.01"
                                       min="0"
                                       addonAfter="₽"
                                       style={{ width: "100%" }}
                                    />
                                 </Form.Item>
                              ) : null;
                           }}
                        </Form.Item>
                     </div>
                  </>
               ) : (
                  <Form.Item
                     name="youtube_url"
                     label="YouTube URL"
                     rules={[
                        { required: true, message: "Введите URL видео" },
                        {
                           pattern:
                              /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/,
                           message: "Введите корректный URL YouTube",
                        },
                     ]}
                  >
                     <Input
                        placeholder="https://www.youtube.com/watch?v=..."
                        className={styles.input}
                        size="large"
                     />
                  </Form.Item>
               )}

               <Form.Item className={styles.submitSection}>
                  <Button
                     type="primary"
                     htmlType="submit"
                     loading={uploading}
                     size="large"
                     className={styles.submitButton}
                  >
                     Опубликовать
                  </Button>
               </Form.Item>
            </Form>
         </Card>
      </div>
   );
};
