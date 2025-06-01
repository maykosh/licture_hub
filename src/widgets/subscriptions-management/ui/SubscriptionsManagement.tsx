import React, { useEffect, useState } from "react";
import {
   Card,
   Space,
   Typography,
   Avatar,
   Button,
   message,
   Row,
   Col,
   Input,
   Empty,
   Spin,
   Tag,
   Statistic,
} from "antd";
import {
   UserOutlined,
   SearchOutlined,
   BookOutlined,
   FileTextOutlined,
   VideoCameraOutlined,
} from "@ant-design/icons";
import { supabase } from "@/shared/supabase/supabaseClient";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { followService } from "@/entities/author/api/followService";

const { Title } = Typography;

interface Author {
   id: string;
   author_name: string;
   avatar_url?: string;
   bio?: string;
   posts_count: number;
   books_count: number;
   media_count: number;
}

interface SubscriptionsManagementProps {
   userId?: string;
}

export const SubscriptionsManagement: React.FC<
   SubscriptionsManagementProps
> = ({ userId }) => {
   const [subscriptions, setSubscriptions] = useState<Author[]>([]);
   const [loading, setLoading] = useState(true);
   const [searchQuery, setSearchQuery] = useState("");
   const navigate = useNavigate();

   useEffect(() => {
      if (userId) {
         fetchSubscriptions();
      }
   }, [userId]);

   const fetchSubscriptions = async () => {
      try {
         setLoading(true);
         const { data: followingData, error: followingError } = await supabase
            .from("followers")
            .select("author_id")
            .eq("user_id", userId);

         if (followingError) throw followingError;

         const authorIds = followingData.map((item) => item.author_id);

         if (authorIds.length === 0) {
            setSubscriptions([]);
            return;
         }

         // Получаем данные об авторах
         const { data: authorsData, error: authorsError } = await supabase
            .from("authors")
            .select("*")
            .in("id", authorIds);

         if (authorsError) throw authorsError;

         // Получаем количество постов, книг и медиа для каждого автора
         const authorsWithCounts = await Promise.all(
            authorsData.map(async (author) => {
               const [postsCount, booksCount, mediaCount] = await Promise.all([
                  supabase
                     .from("posts")
                     .select("id", { count: "exact" })
                     .eq("author_id", author.id),
                  supabase
                     .from("books")
                     .select("id", { count: "exact" })
                     .eq("author_id", author.id),
                  supabase
                     .from("media")
                     .select("id", { count: "exact" })
                     .eq("author_id", author.id),
               ]);

               return {
                  ...author,
                  posts_count: postsCount.count || 0,
                  books_count: booksCount.count || 0,
                  media_count: mediaCount.count || 0,
               };
            })
         );

         setSubscriptions(authorsWithCounts);
      } catch (error) {
         console.error("Ошибка при загрузке подписок:", error);
         message.error("Не удалось загрузить список подписок");
      } finally {
         setLoading(false);
      }
   };

   const handleUnfollow = async (authorId: string) => {
      try {
         if (!userId) return;

         const success = await followService.unfollow(userId, authorId);
         if (success) {
            setSubscriptions((prev) =>
               prev.filter((author) => author.id !== authorId)
            );
            message.success("Вы отписались от автора");
         }
      } catch (error) {
         console.error("Ошибка при отписке:", error);
         message.error("Не удалось отписаться от автора");
      }
   };

   const filteredSubscriptions = subscriptions.filter((author) =>
      author.author_name.toLowerCase().includes(searchQuery.toLowerCase())
   );

   const getStatistics = () => {
      return {
         total: subscriptions.length,
         totalPosts: subscriptions.reduce(
            (sum, author) => sum + author.posts_count,
            0
         ),
         totalBooks: subscriptions.reduce(
            (sum, author) => sum + author.books_count,
            0
         ),
         totalMedia: subscriptions.reduce(
            (sum, author) => sum + author.media_count,
            0
         ),
      };
   };

   const stats = getStatistics();

   return (
      <motion.div
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ duration: 0.5 }}
      >
         <Space direction="vertical" size="large" style={{ width: "100%" }}>
            <Card>
               <Space
                  direction="vertical"
                  size="large"
                  style={{ width: "100%" }}
               >
                  <Space
                     style={{
                        width: "100%",
                        justifyContent: "space-between",
                     }}
                  >
                     <Title level={2} style={{ margin: 0 }}>
                        Мои подписки
                     </Title>
                     <Input
                        placeholder="Поиск по имени автора"
                        prefix={<SearchOutlined />}
                        style={{ width: 300 }}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        allowClear
                     />
                  </Space>

                  <Row gutter={[16, 16]}>
                     <Col xs={24} sm={12} md={6}>
                        <Card>
                           <Statistic
                              title="Подписок"
                              value={stats.total}
                              prefix={<UserOutlined />}
                           />
                        </Card>
                     </Col>
                     <Col xs={24} sm={12} md={6}>
                        <Card>
                           <Statistic
                              title="Всего постов"
                              value={stats.totalPosts}
                              prefix={<FileTextOutlined />}
                           />
                        </Card>
                     </Col>
                     <Col xs={24} sm={12} md={6}>
                        <Card>
                           <Statistic
                              title="Всего книг"
                              value={stats.totalBooks}
                              prefix={<BookOutlined />}
                           />
                        </Card>
                     </Col>
                     <Col xs={24} sm={12} md={6}>
                        <Card>
                           <Statistic
                              title="Всего медиа"
                              value={stats.totalMedia}
                              prefix={<VideoCameraOutlined />}
                           />
                        </Card>
                     </Col>
                  </Row>
               </Space>
            </Card>

            {loading ? (
               <div style={{ textAlign: "center", padding: "40px" }}>
                  <Spin size="large" />
               </div>
            ) : filteredSubscriptions.length > 0 ? (
               <Row gutter={[16, 16]}>
                  {filteredSubscriptions.map((author) => (
                     <Col xs={24} sm={12} md={8} lg={6} key={author.id}>
                        <Card
                           hoverable
                           style={{ height: "100%" }}
                           actions={[
                              <Button
                                 type="text"
                                 onClick={() =>
                                    navigate(`/author/${author.id}`)
                                 }
                              >
                                 Профиль
                              </Button>,
                              <Button
                                 type="text"
                                 danger
                                 onClick={() => handleUnfollow(author.id)}
                              >
                                 Отписаться
                              </Button>,
                           ]}
                        >
                           <Space
                              direction="vertical"
                              align="center"
                              style={{ width: "100%" }}
                           >
                              <Avatar
                                 size={80}
                                 src={author.avatar_url}
                                 icon={<UserOutlined />}
                              />
                              <Title
                                 level={4}
                                 style={{
                                    margin: "12px 0",
                                    textAlign: "center",
                                 }}
                              >
                                 {author.author_name}
                              </Title>
                              <Space>
                                 <Tag icon={<FileTextOutlined />} color="blue">
                                    {author.posts_count} постов
                                 </Tag>
                                 <Tag icon={<BookOutlined />} color="green">
                                    {author.books_count} книг
                                 </Tag>
                                 <Tag
                                    icon={<VideoCameraOutlined />}
                                    color="purple"
                                 >
                                    {author.media_count} медиа
                                 </Tag>
                              </Space>
                           </Space>
                        </Card>
                     </Col>
                  ))}
               </Row>
            ) : (
               <Empty
                  description="У вас пока нет подписок"
                  style={{ padding: "40px" }}
               />
            )}
         </Space>
      </motion.div>
   );
};
