import React, { useEffect, useState } from "react";
import {
   List,
   Card,
   Typography,
   Image,
   Space,
   Modal,
   Button,
   Tooltip,
   message,
} from "antd";
import {
   FileTextOutlined,
   ReadOutlined,
   ShareAltOutlined,
   ClockCircleOutlined,
} from "@ant-design/icons";
import { supabase } from "@/shared/supabase/supabaseClient";
import { LikeButton } from "@/shared/ui/LikeButton";
import { useAuthStore } from "@/entities/auth";
import { motion, useScroll, useSpring } from "framer-motion";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/ru";

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
   created_at: string;
   likes_count: number;
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
   const [selectedPost, setSelectedPost] = useState<Post | null>(null);
   const userId = useAuthStore((state) => state.user?.uid);
   const { scrollYProgress } = useScroll();
   const scaleX = useSpring(scrollYProgress, {
      stiffness: 100,
      damping: 30,
      restDelta: 0.001,
   });

   useEffect(() => {
      const fetchPosts = async () => {
         try {
            setLoading(true);
            let query = supabase.from("posts").select(`
            *,
            authors (
              author_name
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

            if (error) throw error;

            let processedPosts =
               data?.map((post) => ({
                  ...post,
                  author_name: post.authors?.author_name,
                  likes_count: post.likes?.length || 0,
               })) || [];

            // Применяем фильтрацию
            switch (filter) {
               case "popular":
                  processedPosts.sort((a, b) => b.likes_count - a.likes_count);
                  processedPosts = processedPosts.slice(0, 10); // Топ 10 популярных
                  break;
               case "new":
                  processedPosts.sort(
                     (a, b) =>
                        new Date(b.created_at).getTime() -
                        new Date(a.created_at).getTime()
                  );
                  break;
               case "mostLiked":
                  // Фильтруем посты с наибольшим количеством лайков
                  processedPosts = processedPosts
                     .filter((post) => post.likes_count > 0)
                     .sort((a, b) => b.likes_count - a.likes_count);
                  break;
               default:
                  // Для 'all' не применяем дополнительную фильтрацию
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

   const handlePostClick = (post: Post) => {
      setSelectedPost(post);
   };

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

   // Добавляем индикатор прокрутки
   const ScrollIndicator = () => (
      <motion.div
         style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            height: "4px",
            background: "#1890ff",
            transformOrigin: "0%",
            scaleX,
            zIndex: 1000,
         }}
      />
   );

   return (
      <>
         <ScrollIndicator />
         <List
            grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 3, xl: 3, xxl: 4 }}
            dataSource={posts}
            loading={loading}
            renderItem={(post) => (
               <List.Item>
                  <motion.div
                     whileHover={{ y: -5 }}
                     transition={{ duration: 0.2 }}
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                  >
                     <Card
                        hoverable
                        style={{
                           height: "100%",
                           display: "flex",
                           flexDirection: "column",
                           overflow: "hidden",
                           borderRadius: "12px",
                           boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                           transition: "all 0.3s ease",
                        }}
                        bodyStyle={{
                           flex: 1,
                           padding: "16px",
                           display: "flex",
                           flexDirection: "column",
                           gap: "16px",
                        }}
                     >
                        <div
                           style={{
                              width: "100%",
                              aspectRatio: "16/9",
                              position: "relative",
                              overflow: "hidden",
                              borderRadius: "8px",
                              marginBottom: "16px",
                           }}
                        >
                           {post.poster_url ? (
                              <Image
                                 alt={post.title}
                                 src={post.poster_url}
                                 style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                 }}
                                 preview={false}
                              />
                           ) : (
                              <div
                                 style={{
                                    width: "100%",
                                    height: "100%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    background: "#f5f5f5",
                                 }}
                              >
                                 <FileTextOutlined
                                    style={{
                                       fontSize: 48,
                                       color: "#bfbfbf",
                                    }}
                                 />
                              </div>
                           )}
                        </div>

                        <div
                           style={{
                              flex: 1,
                              display: "flex",
                              flexDirection: "column",
                              gap: "12px",
                           }}
                        >
                           <Title
                              level={4}
                              ellipsis={{ rows: 2 }}
                              style={{
                                 margin: 0,
                                 minHeight: "3em",
                                 lineHeight: "1.5",
                              }}
                           >
                              {post.title}
                           </Title>

                           <Paragraph
                              ellipsis={{ rows: 3 }}
                              style={{
                                 margin: 0,
                                 color: "#666",
                                 fontSize: "14px",
                                 lineHeight: "1.6",
                              }}
                           >
                              <div
                                 dangerouslySetInnerHTML={{
                                    __html: post.content,
                                 }}
                              />
                           </Paragraph>
                        </div>

                        <div
                           style={{
                              borderTop: "1px solid #f0f0f0",
                              paddingTop: "16px",
                              marginTop: "auto",
                              display: "flex",
                              flexDirection: "column",
                              gap: "12px",
                           }}
                        >
                           <div
                              style={{
                                 display: "flex",
                                 justifyContent: "space-between",
                                 alignItems: "center",
                              }}
                           >
                              <Space size={16}>
                                 <Text
                                    type="secondary"
                                    style={{ fontSize: "14px" }}
                                 >
                                    {post.author_name}
                                 </Text>
                                 <Text
                                    type="secondary"
                                    style={{ fontSize: "14px" }}
                                 >
                                    <ClockCircleOutlined
                                       style={{ marginRight: 4 }}
                                    />
                                    {dayjs(post.created_at).fromNow()}
                                 </Text>
                              </Space>
                              <LikeButton
                                 contentId={post.id}
                                 contentType="post"
                                 initialLikesCount={post.likes_count}
                                 userId={userId}
                                 size="small"
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
                           </div>

                           <Space.Compact style={{ width: "100%" }}>
                              <Button
                                 type="primary"
                                 icon={<ReadOutlined />}
                                 onClick={(e) => {
                                    e.stopPropagation();
                                    handlePostClick(post);
                                 }}
                                 style={{ width: "calc(100% - 40px)" }}
                              >
                                 Читать
                              </Button>
                              <Tooltip title="Поделиться">
                                 <Button
                                    icon={<ShareAltOutlined />}
                                    onClick={(e) => {
                                       e.stopPropagation();
                                       handleShare(post);
                                    }}
                                 />
                              </Tooltip>
                           </Space.Compact>
                        </div>
                     </Card>
                  </motion.div>
               </List.Item>
            )}
         />

         <Modal
            title={
               <div
                  style={{
                     borderBottom: "1px solid #f0f0f0",
                     paddingBottom: "16px",
                     marginBottom: 0,
                  }}
               >
                  <Title level={3} style={{ margin: "0 0 12px 0" }}>
                     {selectedPost?.title}
                  </Title>
                  <Space size={16}>
                     <Text type="secondary" style={{ fontSize: "14px" }}>
                        {selectedPost?.author_name}
                     </Text>
                     <Text type="secondary" style={{ fontSize: "14px" }}>
                        <ClockCircleOutlined style={{ marginRight: 4 }} />
                        {selectedPost &&
                           dayjs(selectedPost.created_at).fromNow()}
                     </Text>
                  </Space>
               </div>
            }
            open={!!selectedPost}
            onCancel={() => setSelectedPost(null)}
            footer={
               selectedPost && (
                  <div
                     style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "12px 0",
                     }}
                  >
                     <Space size={12}>
                        <LikeButton
                           contentId={selectedPost.id}
                           contentType="post"
                           initialLikesCount={selectedPost.likes_count}
                           userId={userId}
                           onLikeChange={(newCount) => {
                              setSelectedPost((prev) =>
                                 prev
                                    ? { ...prev, likes_count: newCount }
                                    : null
                              );
                              setPosts((prevPosts) =>
                                 prevPosts.map((p) =>
                                    p.id === selectedPost.id
                                       ? { ...p, likes_count: newCount }
                                       : p
                                 )
                              );
                           }}
                        />
                        <Button
                           icon={<ShareAltOutlined />}
                           onClick={() =>
                              selectedPost && handleShare(selectedPost)
                           }
                        >
                           Поделиться
                        </Button>
                     </Space>
                     <Button onClick={() => setSelectedPost(null)}>
                        Закрыть
                     </Button>
                  </div>
               )
            }
            style={{
               top: 20,
               maxWidth: 500,
               margin: "0 auto",
            }}
            width="90%"
         >
            {selectedPost && (
               <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ padding: "24px 0" }}
               >
                  {selectedPost.poster_url && (
                     <motion.div
                        style={{ marginBottom: 32,
                           margin: "0 auto",
                         }}
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                     >
                        <Image
                           alt={selectedPost.title}
                           src={selectedPost.poster_url}
                           style={{
                              width: "100%",
                              maxHeight: "500px",
                              objectFit: "cover",
                              borderRadius: "12px",
                              objectPosition: "center",
                            
                           }}
                        />
                     </motion.div>
                  )}
                  <motion.div
                     className="post-content"
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     transition={{ delay: 0.2 }}
                     dangerouslySetInnerHTML={{
                        __html: selectedPost.content,
                     }}
                     style={{
                        fontSize: "16px",
                        lineHeight: "1.8",
                        color: "#333",
                        margin: "0 auto",
                     }}
                  />
               </motion.div>
            )}
         </Modal>
      </>
   );
};
