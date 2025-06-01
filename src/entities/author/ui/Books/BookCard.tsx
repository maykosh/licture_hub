import React, { useState } from "react";
import {
   Card,
   Typography,
   Space,
   Button,
   Tag,
   message,
   Dropdown,
   Modal,
   Drawer,
   Form,
   Input,
   Switch,
} from "antd";
import {
   EditOutlined,
   DeleteOutlined,
   DownloadOutlined,
   EyeOutlined,
   MoreOutlined,
} from "@ant-design/icons";
import { supabase } from "@/shared";
import { LikeButton } from "@/shared/ui/LikeButton";

const { Text } = Typography;
const { TextArea } = Input;

interface BookCardProps {
   id: number;
   title: string;
   description: string;
   cover_url: string;
   price: string;
   is_paid: boolean;
   file_url: string;
   likesCount: number;
   userId: string;
   onEdit: (id: number) => void;
   onDelete: (id: number) => void;
}

interface BookFormData {
   title: string;
   description: string;
   cover_url: string;
   price: string;
   is_paid: boolean;
}

export const BookCard: React.FC<BookCardProps> = ({
   id,
   title: initialTitle,
   description: initialDescription,
   cover_url: initialCoverUrl,
   price: initialPrice,
   is_paid: initialIsPaid,
   file_url,
   likesCount,
   userId,
   onEdit,
   onDelete,
}) => {
   const [isDrawerOpen, setIsDrawerOpen] = useState(false);
   const [form] = Form.useForm<BookFormData>();
   const [bookData, setBookData] = useState({
      title: initialTitle,
      description: initialDescription,
      cover_url: initialCoverUrl,
      price: initialPrice,
      is_paid: initialIsPaid,
   });

   const handleDelete = async () => {
      try {
         const { error } = await supabase.from("books").delete().eq("id", id);
         if (error) throw error;
         message.success("Книга успешно удалена");
         onDelete(id);
      } catch (error) {
         console.error("Ошибка при удалении книги:", error);
         message.error("Ошибка при удалении книги");
      }
   };

   const handleDownload = () => {
      if (!file_url) {
         message.error("Файл книги недоступен");
         return;
      }
      window.open(file_url, "_blank");
      message.success("Скачивание началось");
   };

   const handleOpen = () => {
      if (!file_url) {
         message.error("Файл книги недоступен");
         return;
      }
      window.open(file_url, "_blank");
   };

   const showDrawer = () => {
      form.setFieldsValue(bookData);
      setIsDrawerOpen(true);
   };

   const handleDrawerClose = () => {
      setIsDrawerOpen(false);
      form.resetFields();
   };

   const handleFormSubmit = async (values: BookFormData) => {
      try {
         const { error } = await supabase
            .from("books")
            .update({
               ...values,
               file_url,
               price: values.price || "0",
            })
            .eq("id", id);

         if (error) throw error;

         setBookData(values);
         message.success("Книга успешно обновлена");
         onEdit(id);
         handleDrawerClose();
      } catch (error) {
         console.error("Ошибка при обновлении книги:", error);
         message.error("Ошибка при обновлении книги");
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
         key: "open",
         icon: <EyeOutlined />,
         label: "Открыть",
         onClick: handleOpen,
      },
      {
         key: "download",
         icon: <DownloadOutlined />,
         label: "Скачать",
         onClick: handleDownload,
      },
      {
         key: "delete",
         icon: <DeleteOutlined />,
         label: "Удалить",
         danger: true,
         onClick: () =>
            Modal.confirm({
               title: "Удалить книгу?",
               content: "Это действие нельзя отменить",
               okText: "Удалить",
               cancelText: "Отмена",
               okType: "danger",
               onOk: handleDelete,
            }),
      },
   ];

   return (
      <>
         <Card
            hoverable
            style={{
               width: "100%",
               height: "100%",
               display: "flex",
               flexDirection: "column",
            }}
            bodyStyle={{
               flex: 1,
               display: "flex",
               flexDirection: "column",
               padding: "12px",
            }}
            cover={
               bookData.cover_url && (
                  <div style={{ position: "relative", padding: 10 }}>
                     <img
                        alt={bookData.title}
                        src={bookData.cover_url}
                        style={{
                           width: "100%",
                           height: 200,
                           objectFit: "cover",
                           borderRadius: "8px",
                        }}
                     />
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
                              style={{
                                 background: "rgba(255, 255, 255, 0.8)",
                              }}
                           />
                        </Dropdown>
                     </div>
                  </div>
               )
            }
         >
            <div style={{ flex: 1 }}>
               <Text
                  strong
                  style={{
                     fontSize: "16px",
                     display: "block",
                     marginBottom: "8px",
                  }}
               >
                  {bookData.title}
               </Text>
               <Text
                  type="secondary"
                  style={{
                     display: "-webkit-box",
                     WebkitLineClamp: 3,
                     WebkitBoxOrient: "vertical",
                     overflow: "hidden",
                     height: "4.5em",
                  }}
               >
                  {bookData.description}
               </Text>
            </div>

            <div
               style={{
                  marginTop: "12px",
                  paddingTop: "12px",
                  borderTop: "1px solid #f0f0f0",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
               }}
            >
               {bookData.is_paid && <Tag color="gold">{bookData.price} ₽</Tag>}
               <div style={{ marginLeft: "auto" }}>
                  <LikeButton
                     contentId={id.toString()}
                     contentType="book"
                     initialLikesCount={likesCount}
                     userId={userId}
                  />
               </div>
            </div>
         </Card>

         <Drawer
            title="Редактировать книгу"
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
            <Form
               form={form}
               layout="vertical"
               onFinish={handleFormSubmit}
               initialValues={bookData}
            >
               <Form.Item
                  name="title"
                  label="Название"
                  rules={[
                     { required: true, message: "Введите название книги" },
                  ]}
               >
                  <Input />
               </Form.Item>

               <Form.Item
                  name="description"
                  label="Описание"
                  rules={[
                     { required: true, message: "Введите описание книги" },
                  ]}
               >
                  <TextArea rows={4} />
               </Form.Item>

               <Form.Item
                  name="cover_url"
                  label="URL обложки"
                  rules={[{ required: true, message: "Введите URL обложки" }]}
               >
                  <Input placeholder="https://example.com/cover.jpg" />
               </Form.Item>

               <Form.Item
                  name="is_paid"
                  label="Платная книга"
                  valuePropName="checked"
               >
                  <Switch />
               </Form.Item>

               <Form.Item
                  noStyle
                  shouldUpdate={(prevValues, currentValues) =>
                     prevValues.is_paid !== currentValues.is_paid
                  }
               >
                  {({ getFieldValue }) =>
                     getFieldValue("is_paid") ? (
                        <Form.Item
                           name="price"
                           label="Цена"
                           rules={[
                              { required: true, message: "Введите цену книги" },
                              {
                                 pattern: /^\d+$/,
                                 message: "Введите корректную цену",
                              },
                           ]}
                        >
                           <Input prefix="₽" />
                        </Form.Item>
                     ) : null
                  }
               </Form.Item>
            </Form>
         </Drawer>
      </>
   );
};
