import React, { useState } from "react";
import {
   Card,
   Typography,
   Space,
   Button,
   Tag,
   message,
   Modal,
   Dropdown,
   Drawer,
   Form,
   Input,
} from "antd";
import {
   DeleteOutlined,
   PlayCircleOutlined,
   EditOutlined,
   MoreOutlined,
} from "@ant-design/icons";
import { supabase } from "@/shared";
import { LikeButton } from "@/shared/ui/LikeButton";

const { Text, Title } = Typography;

interface VideoFormData {
   title: string;
   description: string;
   youtube_url: string;
   cover_url?: string;
   media_type: string;
}

interface VideoCardProps {
   id: string;
   author_id: string;
   title: string;
   description: string;
   youtube_url: string;
   cover_url?: string;
   media_type: string;
   likes_count: number;
   userId: string;
   onEdit: (id: string) => void;
   onDelete: (id: string) => void;
}

export const VideoCard: React.FC<VideoCardProps> = ({
   id,
   author_id,
   title,
   description,
   youtube_url,
   cover_url,
   media_type,
   likes_count,
   userId,
   onEdit,
   onDelete,
}) => {
   const [isDrawerOpen, setIsDrawerOpen] = useState(false);
   const [form] = Form.useForm<VideoFormData>();

   const handleDelete = () => {
      Modal.confirm({
         title: "Удалить видео?",
         content: "Это действие нельзя отменить",
         okText: "Удалить",
         cancelText: "Отмена",
         okType: "danger",
         onOk: async () => {
            try {
               const { error } = await supabase
                  .from("media")
                  .delete()
                  .eq("id", id);

               if (error) throw error;

               message.success("Видео успешно удалено");
               onDelete(id);
            } catch (error) {
               console.error("Ошибка при удалении видео:", error);
               message.error("Ошибка при удалении видео");
            }
         },
      });
   };

   const handleWatch = () => {
      window.open(youtube_url, "_blank");
   };

   const getYouTubeThumbnail = (url: string) => {
      const videoId = url.split("v=")[1];
      return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
   };

   const showDrawer = () => {
      form.setFieldsValue({
         title,
         description,
         youtube_url,
         cover_url,
         media_type,
      });
      setIsDrawerOpen(true);
   };

   const handleDrawerClose = () => {
      setIsDrawerOpen(false);
      form.resetFields();
   };

   const handleFormSubmit = async (values: VideoFormData) => {
      try {
         const { error } = await supabase
            .from("media")
            .update({
               ...values,
               author_id,
            })
            .eq("id", id);

         if (error) throw error;

         message.success("Видео успешно обновлено");
         onEdit(id);
         handleDrawerClose();
      } catch (error) {
         console.error("Ошибка при обновлении видео:", error);
         message.error("Ошибка при обновлении видео");
      }
   };

   const items = [
      {
         key: "edit",
         icon: <EditOutlined />,
         label: "Редактировать",
         onClick: showDrawer,
      },
      {
         key: "watch",
         icon: <PlayCircleOutlined />,
         label: "Смотреть",
         onClick: handleWatch,
      },
      {
         key: "delete",
         icon: <DeleteOutlined />,
         label: "Удалить",
         danger: true,
         onClick: handleDelete,
      },
   ];

   return (
      <>
         <Card
            hoverable
            cover={
               <div style={{ position: "relative", padding: 10 }}>
                  <img
                     alt={title}
                     src={cover_url || getYouTubeThumbnail(youtube_url)}
                     style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                     }}
                  />
                  <div
                     onClick={handleWatch}
                     style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                     }}
                  >
                     <PlayCircleOutlined
                        style={{
                           fontSize: 48,
                           color: "white",
                        }}
                     />
                  </div>
                  <div
                     style={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        zIndex: 1,
                        padding: 10,
                     }}
                  >
                     <Dropdown menu={{ items }} placement="bottomRight">
                        <Button
                           type="text"
                           icon={<MoreOutlined />}
                           style={{ background: "rgba(255, 255, 255, 0.8)" }}
                        />
                     </Dropdown>
                  </div>
               </div>
            }
            actions={[
               <Space key="likes">
                  <LikeButton
                     contentId={id.toString()}
                     contentType="media"
                     initialLikesCount={likes_count}
                     userId={userId}
                  />
               </Space>,
            ]}
         >
            <Space direction="vertical" size="small" style={{ width: "100%" }}>
               <Title
                  level={4}
                  ellipsis={{ rows: 2 }}
                  style={{ marginBottom: 0 }}
               >
                  {title}
               </Title>
               <Text type="secondary" ellipsis>
                  {description}
               </Text>
               <div
                  style={{
                     display: "flex",
                     justifyContent: "space-between",
                     alignItems: "center",
                     marginTop: 8,
                  }}
               >
                  <Space>
                     <Tag color="blue">{media_type}</Tag>
                  </Space>
               </div>
            </Space>
         </Card>

         <Drawer
            title="Редактировать видео"
            width={520}
            open={isDrawerOpen}
            onClose={handleDrawerClose}
            footer={
               <Space style={{ float: "right" }}>
                  <Button onClick={handleDrawerClose}>Отмена</Button>
                  <Button type="primary" onClick={() => form.submit()}>
                     Сохранить
                  </Button>
               </Space>
            }
         >
            <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
               <Form.Item
                  name="title"
                  label="Название"
                  rules={[
                     { required: true, message: "Введите название видео" },
                  ]}
               >
                  <Input />
               </Form.Item>

               <Form.Item
                  name="description"
                  label="Описание"
                  rules={[
                     { required: true, message: "Введите описание видео" },
                  ]}
               >
                  <Input.TextArea rows={4} />
               </Form.Item>

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
                  <Input />
               </Form.Item>

               <Form.Item name="cover_url" label="URL обложки (необязательно)">
                  <Input placeholder="Оставьте пустым для использования превью с YouTube" />
               </Form.Item>

               <Form.Item
                  name="media_type"
                  label="Тип медиа"
                  rules={[{ required: true, message: "Выберите тип медиа" }]}
               >
                  <Input />
               </Form.Item>
            </Form>
         </Drawer>
      </>
   );
};
