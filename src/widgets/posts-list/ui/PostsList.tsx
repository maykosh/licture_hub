import React, { useEffect, useState } from "react";
import { List, Card, Typography, Image, Space, Modal, Button } from "antd";
import { FileTextOutlined, ReadOutlined } from "@ant-design/icons";
import { supabase } from "@/shared/supabase/supabaseClient";
import { LikeButton } from "@/shared/ui/LikeButton";
import { useAuthStore } from "@/entities/auth";
import { motion } from "framer-motion";

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
         } finally {
            setLoading(false);
         }
      };

      fetchPosts();
   }, [searchQuery, authorId, filter]);

   const handlePostClick = (post: Post) => {
      setSelectedPost(post);
   };

   return (
      <>
         <List
            grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 3, xl: 3, xxl: 4 }}
            dataSource={posts}
            loading={loading}
            renderItem={(post) => (
               <List.Item>
                  <motion.div
                     whileHover={{ y: -5 }}
                     transition={{ duration: 0.2 }}
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
                        }}
                     >
                        <Space
                           direction="vertical"
                           style={{
                              width: "100%",
                              height: "100%",
                              justifyContent: "space-between",
                           }}
                        >
                           <div
                              style={{
                                 width: "100%",
                                 aspectRatio: "16/9",
                                 position: "relative",
                                 overflow: "hidden",
                                 borderRadius: "8px",
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
                           <div style={{ flex: 1, padding: "12px 0" }}>
                              <Title
                                 level={4}
                                 ellipsis={{ rows: 2 }}
                                 style={{
                                    marginBottom: 8,
                                    minHeight: "3em",
                                 }}
                              >
                                 {post.title}
                              </Title>
                              <Paragraph
                                 ellipsis={{ rows: 3 }}
                                 style={{
                                    marginBottom: 8,
                                    minHeight: "4.5em",
                                    color: "#666",
                                 }}
                              >
                                 <div
                                    dangerouslySetInnerHTML={{
                                       __html: post.content,
                                    }}
                                 />
                              </Paragraph>
                           </div>
                           <Space
                              direction="vertical"
                              style={{ width: "100%" }}
                           >
                              <div
                                 style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    borderTop: "1px solid #f0f0f0",
                                    paddingTop: "12px",
                                 }}
                              >
                                 <Text type="secondary">
                                    Автор: {post.author_name}
                                 </Text>
                                 <Space>
                                    <Text type="secondary">
                                       {new Date(
                                          post.created_at
                                       ).toLocaleDateString("ru-RU")}
                                    </Text>
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
                                                   ? {
                                                        ...p,
                                                        likes_count: newCount,
                                                     }
                                                   : p
                                             )
                                          );
                                       }}
                                    />
                                 </Space>
                              </div>
                              <Button
                                 type="primary"
                                 icon={<ReadOutlined />}
                                 onClick={(e) => {
                                    e.stopPropagation();
                                    handlePostClick(post);
                                 }}
                                 block
                              >
                                 Читать
                              </Button>
                           </Space>
                        </Space>
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
                     paddingBottom: 16,
                  }}
               >
                  <Title level={3} style={{ margin: 0 }}>
                     {selectedPost?.title}
                  </Title>
                  <Space style={{ marginTop: 8 }}>
                     <Text type="secondary">
                        Автор: {selectedPost?.author_name}
                     </Text>
                     <Text type="secondary">
                        {selectedPost &&
                           new Date(selectedPost.created_at).toLocaleDateString(
                              "ru-RU"
                           )}
                     </Text>
                  </Space>
               </div>
            }
            open={!!selectedPost}
            onCancel={() => setSelectedPost(null)}
            footer={null}
            // width={600}
            style={{ top: 20 }}
         >
            {selectedPost && (
               <div style={{ padding: "20px 0" }}>
                  {selectedPost.poster_url && (
                     <div style={{ marginBottom: 24 }}>
                        <Image
                           alt={selectedPost.title}
                           src={selectedPost.poster_url}
                           style={{
                              width: "100%",
                              maxHeight: "400px",
                              objectFit: "cover",
                              borderRadius: "8px",
                              objectPosition: "center",
                           }}
                        />
                     </div>
                  )}
                  <Space
                     direction="vertical"
                     size="large"
                     style={{ width: "100%" }}
                  >
                     <div
                        className="post-content"
                        dangerouslySetInnerHTML={{
                           __html: selectedPost.content,
                        }}
                        style={{
                           fontSize: "16px",
                           lineHeight: "1.8",
                           color: "#333",
                        }}
                     />
                     <div
                        style={{
                           display: "flex",
                           justifyContent: "space-between",
                           alignItems: "center",
                           marginTop: 24,
                           padding: "16px 0",
                           borderTop: "1px solid #f0f0f0",
                        }}
                     >
                        <Text type="secondary">
                           Опубликовано:{" "}
                           {new Date(
                              selectedPost.created_at
                           ).toLocaleDateString("ru-RU")}
                        </Text>
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
                     </div>
                  </Space>
               </div>
            )}
         </Modal>
      </>
   );
};
