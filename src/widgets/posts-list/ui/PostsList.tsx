import React, { useState, useEffect } from "react";
import {
   List,
   Card,
   Typography,
   Image,
   Space,
   Button,
   message,
   Avatar,
   Divider,
   Badge,
} from "antd";
import {
   UserOutlined,
   ClockCircleOutlined,
   ShareAltOutlined,
   MessageOutlined,
} from "@ant-design/icons";
import { supabase } from "@/shared/supabase/supabaseClient";
import { LikeButton } from "@/shared/ui/LikeButton";
import { CommentSection } from "@/shared/ui/CommentSection/CommentSection";
import { useAuthStore } from "@/entities/auth";
import { motion, AnimatePresence } from "framer-motion";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/ru";
import { useNavigate } from "react-router-dom";

dayjs.extend(relativeTime);
dayjs.locale("ru");

const { Title, Text, Paragraph } = Typography;

interface Post {
   id: string;
   title: string;
   content: string;
   poster_url: string;
   author_name: string;
   author_id: string;
   author_avatar?: string;
   created_at: string;
   likes_count: number;
   comments_count: number;
   tags?: string[];
   reading_time?: number;
}

interface PostsListProps {
   searchQuery: string;
   authorId?: string;
   filter?: "all" | "popular" | "new" | "mostLiked";
}

export const PostsList: React.FC<PostsListProps> = ({
   searchQuery,
   authorId,
   filter = "all",
}) => {
   const [posts, setPosts] = useState<Post[]>([]);
   const [loading, setLoading] = useState(true);
   const [expandedComments, setExpandedComments] = useState<string[]>([]);
   const userId = useAuthStore((state) => state.user?.uid);
   const navigate = useNavigate();

   useEffect(() => {
      const fetchPosts = async () => {
         try {
            setLoading(true);
            let query = supabase.from("posts").select(`
               *,
               authors (
                  author_name,
                  avatar_url
               ),
               likes (count)
            `);

            if (searchQuery) {
               query = query.or(
                  `title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`
               );
            }

            if (authorId) {
               query = query.eq("author_id", authorId);
            }

            const { data, error } = await query;

            if (error) {
               console.error("Ошибка при загрузке постов:", error);
               message.error("Не удалось загрузить посты");
               return;
            }

            const processedPosts =
               data?.map((post) => ({
                  ...post,
                  author_name: post.authors?.author_name,
                  author_avatar: post.authors?.avatar_url,
                  likes_count: post.likes?.length || 0,
                  comments_count: 0, // Временно установим в 0, пока не будет создана таблица комментариев
                  reading_time: Math.ceil(post.content.length / 1000), // Примерное время чтения
               })) || [];

            // Применяем фильтрацию
            switch (filter) {
               case "popular":
                  processedPosts.sort((a, b) => b.likes_count - a.likes_count); // Сортируем по лайкам вместо просмотров
                  break;
               case "new":
                  processedPosts.sort(
                     (a, b) =>
                        new Date(b.created_at).getTime() -
                        new Date(a.created_at).getTime()
                  );
                  break;
               case "mostLiked":
                  processedPosts.sort((a, b) => b.likes_count - a.likes_count);
                  break;
               default:
                  break;
            }

            setPosts(processedPosts);
         } catch (error) {
            console.error("Ошибка при загрузке постов:", error);
            message.error("Не удалось загрузить посты");
         } finally {
            setLoading(false);
         }
      };

      fetchPosts();
   }, [searchQuery, authorId, filter]);

   const handleShare = async (post: Post) => {
      try {
         await navigator.clipboard.writeText(
            window.location.origin + `/post/${post.id}`
         );
         message.success("Ссылка скопирована в буфер обмена");
      } catch (error) {
         console.error("Ошибка при копировании ссылки:", error);
         message.error("Не удалось скопировать ссылку");
      }
   };

   const handleAuthorClick = (authorId: string) => {
      navigate(`/author/${authorId}`);
   };

   const handlePostClick = (postId: string) => {
      navigate(`/post/${postId}`);
   };

   const toggleComments = (postId: string) => {
      setExpandedComments((prev) =>
         prev.includes(postId)
            ? prev.filter((id) => id !== postId)
            : [...prev, postId]
      );
   };

   return (
      <List
         itemLayout="vertical"
         size="large"
         dataSource={posts}
         loading={loading}
         split={false}
         style={{ maxWidth: 1200, margin: "0 auto" }}
         renderItem={(post) => (
            <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.3 }}
            >
               <Card
                  style={{
                     marginBottom: 24,
                     borderRadius: 8,
                     cursor: "pointer",
                     transition: "all 0.3s ease",
                  }}
                  bodyStyle={{ padding: 24 }}
                  hoverable
               >
                  <Space
                     direction="vertical"
                     size={16}
                     style={{ width: "100%" }}
                  >
                     {/* Хедер поста */}
                     <Space
                        style={{
                           width: "100%",
                           justifyContent: "space-between",
                           marginBottom: 8,
                        }}
                     >
                        <Space size={12}>
                           <Avatar
                              src={post.author_avatar}
                              icon={<UserOutlined />}
                              size={40}
                              onClick={(e?: React.MouseEvent<HTMLElement>) => {
                                 if (e) e.stopPropagation();
                                 handleAuthorClick(post.author_id);
                              }}
                              style={{ cursor: "pointer" }}
                           />
                           <Space direction="vertical" size={0}>
                              <Text
                                 strong
                                 style={{ fontSize: 16, cursor: "pointer" }}
                                 onClick={(e) => {
                                    e.stopPropagation();
                                    handleAuthorClick(post.author_id);
                                 }}
                              >
                                 {post.author_name}
                              </Text>
                              <Text type="secondary" style={{ fontSize: 14 }}>
                                 <ClockCircleOutlined
                                    style={{ marginRight: 4 }}
                                 />
                                 {dayjs(post.created_at).fromNow()}
                              </Text>
                           </Space>
                        </Space>
                        <Space size={16}>
                           <Text type="secondary">
                              {post.reading_time} мин чтения
                           </Text>
                        </Space>
                     </Space>

                     {/* Теги */}
                     {/* <Space style={{ marginBottom: 8 }}>
                        {post.tags?.map((tag) => (
                           <Tag
                              key={tag}
                              color="blue"
                              style={{
                                 borderRadius: 16,
                                 padding: "4px 12px",
                                 fontSize: 14,
                              }}
                           >
                              {tag}
                           </Tag>
                        ))}
                     </Space> */}

                     {/* Заголовок */}
                     <Title
                        level={2}
                        style={{
                           fontSize: 24,
                           marginBottom: 16,
                           lineHeight: 1.4,
                           color: "dodgerblue",
                        }}
                        onClick={() => handlePostClick(post.id)}
                     >
                        {post.title}
                     </Title>

                     {/* Изображение */}
                     {post.poster_url && (
                        <div
                           style={{
                              marginBottom: 16,
                              borderRadius: 8,
                              overflow: "hidden",
                           }}
                        >
                           <Image
                              src={post.poster_url}
                              alt={post.title}
                              style={{
                                 width: "100%",
                                 maxHeight: 400,
                                 objectFit: "cover",
                              }}
                              preview={false}
                           />
                        </div>
                     )}

                     {/* Контент */}
                     <Paragraph
                        ellipsis={{ rows: 3 }}
                        style={{
                           fontSize: 16,
                           lineHeight: 1.8,
                           color: "rgba(0, 0, 0, 0.85)",
                           marginBottom: 16,
                        }}
                     >
                        <div
                           dangerouslySetInnerHTML={{
                              __html: post.content,
                           }}
                        />
                     </Paragraph>

                     <Divider style={{ margin: "16px 0" }} />

                     {/* Футер поста */}
                     <Space
                        style={{
                           width: "100%",
                           justifyContent: "space-between",
                           flexWrap:"wrap"
                        }}
                     >
                        <Space size="large">
                           <LikeButton
                              contentId={post.id}
                              contentType="post"
                              initialLikesCount={post.likes_count}
                              userId={userId}
                              size="large"
                              onLikeChange={(newCount) => {
                                 setPosts((prevPosts) =>
                                    prevPosts.map((p) =>
                                       p.id === post.id
                                          ? { ...p, likes_count: newCount }
                                          : p
                                    )
                                 );
                              }}
                           />
                           <Badge count={post.comments_count}>
                              <Button
                                 type={
                                    expandedComments.includes(post.id)
                                       ? "primary"
                                       : "text"
                                 }
                                 icon={<MessageOutlined />}
                                 size="large"
                                 onClick={(e) => {
                                    e.stopPropagation();
                                    toggleComments(post.id);
                                 }}
                              >
                                 Комментарии
                              </Button>
                           </Badge>
                           {/* <Button
                              type="text"
                              icon={<BookOutlined />}
                              size="large"
                           /> */}
                        </Space>
                        <Button
                           type="text"
                           icon={<ShareAltOutlined />}
                           onClick={(e: React.MouseEvent<HTMLElement>) => {
                              e.stopPropagation();
                              handleShare(post);
                           }}
                           size="large"
                        >
                           Поделиться
                        </Button>
                     </Space>

                     {/* Секция комментариев */}
                     <AnimatePresence>
                        {expandedComments.includes(post.id) && (
                           <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                           >
                              <CommentSection
                                 postId={post.id}
                                 authorId={post.author_id}
                              />
                           </motion.div>
                        )}
                     </AnimatePresence>
                  </Space>
               </Card>
            </motion.div>
         )}
      />
   );
};
