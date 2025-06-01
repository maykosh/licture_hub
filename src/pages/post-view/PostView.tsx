import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
   Card,
   Typography,
   Space,
   Avatar,
   Button,
   Divider,
   Image,
   message,
   Skeleton,
} from "antd";
import {
   UserOutlined,
   ClockCircleOutlined,
   ShareAltOutlined,
   BookOutlined,
   MessageOutlined,
} from "@ant-design/icons";
import { supabase } from "@/shared/supabase/supabaseClient";
import { LikeButton } from "@/shared/ui/LikeButton";
import { useAuthStore } from "@/entities/auth";
import { motion } from "framer-motion";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/ru";
import { CommentSection } from "@/shared/ui/CommentSection/CommentSection";

dayjs.extend(relativeTime);
dayjs.locale("ru");

const { Title, Text } = Typography;

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

export const PostView: React.FC = () => {
   const { postId } = useParams<{ postId: string }>();
   const [post, setPost] = useState<Post | null>(null);
   const [loading, setLoading] = useState(true);
   const navigate = useNavigate();
   const userId = useAuthStore((state) => state.user?.uid);
   const commentsSectionRef = useRef<HTMLDivElement>(null);

   useEffect(() => {
      const fetchPost = async () => {
         if (!postId) return;

         try {
            setLoading(true);
            const { data, error } = await supabase
               .from("posts")
               .select(
                  `
                  *,
                  authors (
                     author_name,
                     avatar_url
                  ),
                  likes (count)
               `
               )
               .eq("id", postId)
               .single();

            if (error) throw error;

            if (data) {
               setPost({
                  ...data,
                  author_name: data.authors?.author_name,
                  author_avatar: data.authors?.avatar_url,
                  likes_count: data.likes?.length || 0,
                  comments_count: 0,
                  reading_time: Math.ceil(data.content.length / 1000),
               });
            }
         } catch (error) {
            console.error("Ошибка при загрузке поста:", error);
            message.error("Не удалось загрузить пост");
            navigate("/");
         } finally {
            setLoading(false);
         }
      };

      fetchPost();
   }, [postId, navigate]);

   const handleShare = async () => {
      try {
         await navigator.clipboard.writeText(window.location.href);
         message.success("Ссылка скопирована в буфер обмена");
      } catch (error) {
         console.error("Ошибка при копировании ссылки:", error);
         message.error("Не удалось скопировать ссылку");
      }
   };

   const handleAuthorClick = () => {
      if (post?.author_id) {
         navigate(`/author/${post.author_id}`);
      }
   };

   if (loading) {
      return (
         <div style={{ padding: "24px" }}>
            <Skeleton active avatar paragraph={{ rows: 4 }} />
         </div>
      );
   }

   if (!post) {
      return (
         <div style={{ padding: "24px", textAlign: "center" }}>
            <Title level={3}>Пост не найден</Title>
            <Button type="primary" onClick={() => navigate("/")}>
               Вернуться на главную
            </Button>
         </div>
      );
   }

   return (
      <motion.div
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ duration: 0.5 }}
         style={{ padding: "24px", maxWidth: 1200, margin: "0 auto" }}
      >
         <Card bordered={false}>
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
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
                        onClick={handleAuthorClick}
                        style={{ cursor: "pointer" }}
                     />
                     <Space direction="vertical" size={0}>
                        <Text
                           strong
                           style={{ fontSize: 16, cursor: "pointer" }}
                           onClick={handleAuthorClick}
                        >
                           {post.author_name}
                        </Text>
                        <Text type="secondary" style={{ fontSize: 14 }}>
                           <ClockCircleOutlined style={{ marginRight: 4 }} />
                           {dayjs(post.created_at).fromNow()}
                        </Text>
                     </Space>
                  </Space>
                  <Text type="secondary">{post.reading_time} мин чтения</Text>
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
               <Title level={1} style={{ margin: 0 }}>
                  {post.title}
               </Title>

               {/* Изображение */}
               {post.poster_url && (
                  <div
                     style={{
                        marginBottom: 24,
                        borderRadius: 8,
                        overflow: "hidden",
                     }}
                  >
                     <Image
                        src={post.poster_url}
                        alt={post.title}
                        style={{
                           width: "100%",
                           maxHeight: 600,
                           objectFit: "cover",
                        }}
                     />
                  </div>
               )}

               {/* Контент */}
               <div
                  style={{
                     fontSize: 18,
                     lineHeight: 1.8,
                     color: "rgba(0, 0, 0, 0.85)",
                  }}
                  dangerouslySetInnerHTML={{ __html: post.content }}
               />

               <Divider />

               {/* Футер поста */}
               <Space
                  style={{
                     width: "100%",
                     justifyContent: "space-between",
                  }}
               >
                  <Space size="large">
                     <LikeButton
                        contentId={post.id}
                        contentType="post"
                        initialLikesCount={post.likes_count}
                        userId={userId}
                        size="large"
                        onLikeChange={(newCount) =>
                           setPost((prev) =>
                              prev ? { ...prev, likes_count: newCount } : null
                           )
                        }
                     />
                     <Button
                        type="text"
                        icon={<MessageOutlined />}
                        size="large"
                        onClick={() => {
                           commentsSectionRef.current?.scrollIntoView({
                              behavior: "smooth",
                           });
                        }}
                     >
                        Комментарии
                     </Button>
                     <Button type="text" icon={<BookOutlined />} size="large" />
                  </Space>
                  <Button
                     type="text"
                     icon={<ShareAltOutlined />}
                     onClick={handleShare}
                     size="large"
                  >
                     Поделиться
                  </Button>
               </Space>
            </Space>
         </Card>

         {/* Секция комментариев */}
         <Card
            ref={commentsSectionRef}
            style={{
               marginTop: 24,
               borderRadius: 8,
               boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            }}
         >
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
               <Title level={4}>Комментарии</Title>
               <CommentSection postId={post.id} authorId={post.author_id} />
            </Space>
         </Card>
      </motion.div>
   );
};
