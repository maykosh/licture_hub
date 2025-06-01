import React, { useState } from "react";
import {
   Card,
   Typography,
   Space,
   Button,
   Tag,
   Dropdown,
   Modal,
   Skeleton,
   Divider,
} from "antd";
import {
   EditOutlined,
   DeleteOutlined,
   CalendarOutlined,
   MoreOutlined,
   ReadOutlined,
   FileImageOutlined,
   MessageOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";
import { IPosts } from "../../model/type";
import { LikeButton } from "@/shared/ui/LikeButton";
import { CommentSection } from "@/shared/ui/CommentSection/CommentSection";

const { Title, Text } = Typography;

interface PostCardProps {
   posts: IPosts & {
      categories?: string[];
      views?: number;
   };
   onEdit: (id: string) => void;
   onDelete: (id: string) => void;
   likeCount?: number;
   loading?: boolean;
   userId: string;
}

export const PostCard: React.FC<PostCardProps> = ({
   posts,
   onEdit,
   onDelete,
   likeCount = 0,
   loading = false,
   userId,
}) => {
   const [isModalVisible, setIsModalVisible] = useState(false);
   const [currentLikeCount, setCurrentLikeCount] = useState(likeCount);

   const handleLikeChange = (newCount: number) => {
      setCurrentLikeCount(newCount);
   };

   const formatDate = (date: string) => {
      const options: Intl.DateTimeFormatOptions = {
         year: "numeric",
         month: "long",
         day: "numeric",
      };
      return new Date(date).toLocaleDateString("ru-RU", options);
   };

   const items = [
      {
         key: "read",
         icon: <ReadOutlined />,
         label: "Читать",
         onClick: () => setIsModalVisible(true),
      },
      {
         key: "edit",
         icon: <EditOutlined />,
         label: "Редактировать",
         onClick: () => onEdit(posts.id),
      },
      {
         key: "delete",
         icon: <DeleteOutlined />,
         label: "Удалить",
         danger: true,
         onClick: () => onDelete(posts.id),
      },
   ];

   return (
      <>
         <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
            <Card
               hoverable
               loading={loading}
               style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                  borderRadius: "12px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
               }}
               cover={
                  <div style={{ position: "relative", padding: 10 }}>
                     {posts.poster_url ? (
                        <img
                           alt={posts.title}
                           src={posts.poster_url}
                           style={{
                              width: "100%",
                              height: 200,
                              objectFit: "cover",
                              borderRadius: "8px",
                           }}
                        />
                     ) : (
                        <div
                           style={{
                              width: "100%",
                              height: 200,
                              borderRadius: "8px",
                              background: "#f5f5f5",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexDirection: "column",
                           }}
                        >
                           <FileImageOutlined
                              style={{ fontSize: 48, color: "#bfbfbf" }}
                           />
                           {/* <Text type="secondary" style={{ marginTop: 8 }}>
                              Изображение отсутствует
                           </Text> */}
                        </div>
                     )}
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
               }
            >
               {loading ? (
                  <Skeleton active paragraph={{ rows: 2 }} />
               ) : (
                  <Space
                     direction="vertical"
                     size="small"
                     style={{ width: "100%" }}
                  >
                     <Title
                        level={4}
                        style={{
                           marginBottom: 8,
                           fontSize: "1.2rem",
                           fontWeight: 600,
                        }}
                     >
                        {posts.title}
                     </Title>

                     {/* <Paragraph
                        ellipsis={{
                           rows: 3,
                           expandable: false,
                        }}
                        style={{
                           margin: "8px 0",
                           fontSize: 14,
                           color: "#666",
                           minHeight: "4.5em",
                        }}
                     >
                        <div dangerouslySetInnerHTML={{ __html: posts.content }} />
                     </Paragraph> */}

                     {posts.categories && (
                        <Space size={[0, 8]} wrap style={{ marginBottom: 8 }}>
                           {posts.categories.map((category, index) => (
                              <Tag
                                 key={index}
                                 color="blue"
                                 style={{
                                    borderRadius: 16,
                                    padding: "2px 12px",
                                    fontSize: "0.85rem",
                                    border: "none",
                                    background: "rgba(24, 144, 255, 0.1)",
                                    color: "#1890ff",
                                 }}
                              >
                                 {category}
                              </Tag>
                           ))}
                        </Space>
                     )}

                     <div
                        style={{
                           display: "flex",
                           justifyContent: "space-between",
                           alignItems: "center",
                           color: "#8c8c8c",
                           marginTop: 12,
                           paddingTop: 12,
                           borderTop: "1px solid #f0f0f0",
                        }}
                     >
                        <Space size="middle">
                           <Text
                              type="secondary"
                              style={{ fontSize: "0.9rem" }}
                           >
                              <CalendarOutlined style={{ marginRight: 4 }} />
                              {formatDate(posts.created_at)}
                           </Text>
                           <Button
                              type="link"
                              icon={<ReadOutlined />}
                              onClick={() => setIsModalVisible(true)}
                              style={{ fontSize: "0.9rem", padding: 0 }}
                           >
                              Читать
                           </Button>
                        </Space>

                        <Button
                           type="text"
                           icon={<MessageOutlined />}
                           onClick={() => setIsModalVisible(true)}
                           style={{ fontSize: "0.9rem", padding: 0 }}
                        >
                           Комментарии
                        </Button>
                        <Text type="secondary" style={{ fontSize: "0.9rem" }}>
                           <LikeButton
                              contentId={posts.id}
                              contentType="post"
                              initialLikesCount={currentLikeCount}
                              userId={userId}
                              onLikeChange={handleLikeChange}
                           />
                        </Text>
                     </div>
                  </Space>
               )}
            </Card>
         </motion.div>

         <Modal
            title={
               <Title level={4} style={{ margin: 0 }}>
                  {posts.title}
               </Title>
            }
            open={isModalVisible}
            onCancel={() => setIsModalVisible(false)}
            footer={null}
            width={800}
            style={{ top: 20 }}
         >
            <div style={{ padding: "20px 0" }}>
               {posts.poster_url && (
                  <img
                     src={posts.poster_url}
                     alt={posts.title}
                     style={{
                        width: "100%",
                        maxHeight: 400,
                        objectFit: "cover",
                        borderRadius: 8,
                        marginBottom: 24,
                     }}
                  />
               )}
               <div
                  className="post-content"
                  dangerouslySetInnerHTML={{ __html: posts.content }}
                  style={{
                     fontSize: "16px",
                     lineHeight: 1.8,
                     color: "#333",
                  }}
               />
               <div
                  style={{
                     marginTop: 24,
                     paddingTop: 24,
                     borderTop: "1px solid #f0f0f0",
                     display: "flex",
                     justifyContent: "space-between",
                     alignItems: "center",
                  }}
               >
                  <Space size="middle">
                     <Text type="secondary">
                        Опубликовано: {formatDate(posts.created_at)}
                     </Text>
                     {posts.categories && (
                        <Space size={[0, 8]} wrap>
                           {posts.categories.map((category, index) => (
                              <Tag
                                 key={index}
                                 color="blue"
                                 style={{
                                    borderRadius: 16,
                                    padding: "2px 12px",
                                    fontSize: "0.85rem",
                                    border: "none",
                                    background: "rgba(24, 144, 255, 0.1)",
                                    color: "#1890ff",
                                 }}
                              >
                                 {category}
                              </Tag>
                           ))}
                        </Space>
                     )}
                  </Space>
                  <LikeButton
                     contentId={posts.id}
                     contentType="post"
                     initialLikesCount={currentLikeCount}
                     userId={userId}
                     onLikeChange={handleLikeChange}
                     size="large"
                  />
               </div>
               <Divider />
               <div style={{ marginTop: 24 }}>
                  <Title level={4}>Комментарии</Title>
                  <CommentSection
                     postId={posts.id}
                     authorId={posts.author_id}
                  />
               </div>
            </div>
         </Modal>
      </>
   );
};
