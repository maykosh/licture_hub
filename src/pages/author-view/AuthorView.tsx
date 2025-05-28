import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
   Card,
   Typography,
   Avatar,
   Space,
   Tabs,
   Spin,
   Row,
   Col,
   Badge,
} from "antd";
import {
   UserOutlined,
   TrophyOutlined,
   StarFilled,
   CrownFilled,
   ThunderboltFilled,
   FireFilled,
   RocketFilled,
   HeartFilled,
   TeamOutlined,
   FileTextOutlined,
   BookOutlined,
   PlayCircleOutlined,
} from "@ant-design/icons";
import { supabase } from "@/shared/supabase/supabaseClient";
import { BooksList } from "@/widgets/books-list";
import { MediaList } from "@/widgets/media-list";
import { PostsList } from "@/widgets/posts-list";
import { useAuthStore } from "@/entities/auth";
import { FollowButton } from "@/entities/author/ui/FollowButton";
import { followService } from "@/entities/author/api/followService";
import { motion } from "framer-motion";

const { Title, Text } = Typography;

interface Author {
   id: string;
   author_name: string;
   avatar_url: string;
   bio: string;
   followersCount: number;
   postsCount: number;
   booksCount: number;
   mediaCount: number;
   likesCount: number;
   achievements: string[];
}

const StatisticItem: React.FC<{
   icon: React.ReactNode;
   value: number;
   label: string;
}> = ({ icon, value, label }) => (
   <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <div
         style={{
            fontSize: "20px",
            opacity: 0.8,
            display: "flex",
            alignItems: "center",
         }}
      >
         {icon}
      </div>
      <div>
         <div
            style={{
               fontSize: "1.25rem",
               fontWeight: 600,
               lineHeight: 1.2,
               color: "rgba(0, 0, 0, 0.85)",
            }}
         >
            {value}
         </div>
         <div
            style={{
               fontSize: "0.875rem",
               color: "rgba(0, 0, 0, 0.45)",
            }}
         >
            {label}
         </div>
      </div>
   </div>
);

export const AuthorView: React.FC = () => {
   const { authorId } = useParams<{ authorId: string }>();
   const [author, setAuthor] = useState<Author | null>(null);
   const [loading, setLoading] = useState(true);
   const [isFollowing, setIsFollowing] = useState(false);
   const currentUser = useAuthStore((state) => state.user);

   // Массив иконок для достижений
   const achievementIcons = [
      { icon: <StarFilled />, color: "#FFD700" }, // Золотой
      { icon: <CrownFilled />, color: "#9C27B0" }, // Фиолетовый
      { icon: <ThunderboltFilled />, color: "#2196F3" }, // Синий
      { icon: <FireFilled />, color: "#FF5722" }, // Оранжевый
      { icon: <RocketFilled />, color: "#4CAF50" }, // Зеленый
      { icon: <HeartFilled />, color: "#E91E63" }, // Розовый
   ];

   useEffect(() => {
      const fetchAuthorProfile = async () => {
         if (!authorId) return;

         try {
            setLoading(true);
            const { data: authorData, error: authorError } = await supabase
               .from("authors")
               .select("*")
               .eq("id", authorId)
               .single();

            if (authorError) throw authorError;

            // Получаем количество постов
            const { count: postsCount } = await supabase
               .from("posts")
               .select("*", { count: "exact", head: true })
               .eq("author_id", authorId);

            // Получаем количество книг
            const { count: booksCount } = await supabase
               .from("books")
               .select("*", { count: "exact", head: true })
               .eq("author_id", authorId);

            // Получаем количество медиа
            const { count: mediaCount } = await supabase
               .from("media")
               .select("*", { count: "exact", head: true })
               .eq("author_id", authorId)
               .eq("media_type", "video");

            // Получаем количество подписчиков
            const { count: followersCount } = await supabase
               .from("followers")
               .select("*", { count: "exact", head: true })
               .eq("author_id", authorId);

            // Если есть текущий пользователь, проверяем подписку
            if (currentUser && currentUser.uid !== authorId) {
               const isUserFollowing = await followService.isFollowing(
                  currentUser.uid,
                  authorId
               );
               setIsFollowing(isUserFollowing);
            }

            // Получаем общее количество лайков
            const { count: likesCount } = await supabase
               .from("likes")
               .select("*", { count: "exact", head: true })
               .or(`post_id.eq.null,book_id.eq.null,media_id.eq.null`)
               .eq("author_id", authorId);

            setAuthor({
               ...authorData,
               postsCount: postsCount || 0,
               booksCount: booksCount || 0,
               mediaCount: mediaCount || 0,
               followersCount: followersCount || 0,
               likesCount: likesCount || 0,
            });
         } catch (error) {
            console.error("Ошибка при загрузке профиля:", error);
         } finally {
            setLoading(false);
         }
      };

      fetchAuthorProfile();
   }, [authorId, currentUser]);

   const handleFollowChange = (newIsFollowing: boolean) => {
      if (author) {
         setAuthor({
            ...author,
            followersCount: author.followersCount + (newIsFollowing ? 1 : -1),
         });
         setIsFollowing(newIsFollowing);
      }
   };

   if (loading) {
      return (
         <div
            style={{
               display: "flex",
               justifyContent: "center",
               padding: "48px",
            }}
         >
            <Spin size="large" />
         </div>
      );
   }

   if (!author) {
      return (
         <div style={{ textAlign: "center", padding: "48px" }}>
            <Text>Автор не найден</Text>
         </div>
      );
   }

   const tabItems = [
      {
         key: "books",
         label: "Книги",
         children: <BooksList searchQuery="" authorId={authorId} />,
      },
      {
         key: "media",
         label: "Медиа",
         children: <MediaList searchQuery="" authorId={authorId} />,
      },
      {
         key: "posts",
         label: "Посты",
         children: <PostsList searchQuery="" authorId={authorId} />,
      },
   ];

   return (
      <div style={{ padding: "24px" }}>
         <Card>
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
               <Space align="start" size="large">
                  <motion.div
                     style={{ position: "relative" }}
                     whileHover={{ scale: 1.05 }}
                     transition={{ duration: 0.3 }}
                  >
                     <Avatar
                        size={160}
                        icon={<UserOutlined style={{ fontSize: 80 }} />}
                        src={author.avatar_url}
                        style={{
                           border: "6px solid white",
                           boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
                           transition: "all 0.3s ease",
                        }}
                     />
                  </motion.div>
                  <Space direction="vertical" size="middle" style={{ flex: 1 }}>
                     <div
                        style={{
                           display: "flex",
                           alignItems: "center",
                           gap: "24px",
                           marginBottom: "16px",
                        }}
                     >
                        <Title
                           level={2}
                           style={{ margin: 0, fontSize: "2.5rem" }}
                        >
                           {author.author_name}
                        </Title>
                        {currentUser && currentUser.uid !== author.id && (
                           <FollowButton
                              authorId={author.id}
                              initialIsFollowing={isFollowing}
                              onFollowChange={handleFollowChange}
                           />
                        )}
                     </div>

                     {author.bio && (
                        <Text
                           style={{
                              fontSize: "1.1rem",
                              color: "rgba(0, 0, 0, 0.65)",
                              maxWidth: "800px",
                              lineHeight: "1.6",
                           }}
                        >
                           {author.bio}
                        </Text>
                     )}

                     <div
                        style={{
                           display: "flex",
                           gap: "32px",
                           marginTop: "24px",
                           flexWrap: "wrap",
                        }}
                     >
                        <StatisticItem
                           icon={<TeamOutlined />}
                           value={author.followersCount || 0}
                           label="Подписчиков"
                        />
                        <StatisticItem
                           icon={<FileTextOutlined />}
                           value={author.postsCount}
                           label="Постов"
                        />
                        <StatisticItem
                           icon={<BookOutlined />}
                           value={author.booksCount}
                           label="Книг"
                        />
                        <StatisticItem
                           icon={<PlayCircleOutlined />}
                           value={author.mediaCount}
                           label="Видео"
                        />
                        <StatisticItem
                           icon={<HeartFilled style={{ color: "#ff4d4f" }} />}
                           value={author.likesCount}
                           label="Лайков"
                        />
                     </div>
                  </Space>
               </Space>

               {author.achievements && author.achievements.length > 0 && (
                  <Card
                     title={
                        <Space>
                           <TrophyOutlined
                              style={{ fontSize: 24, color: "#faad14" }}
                           />
                           <Title level={4} style={{ margin: 0 }}>
                              Достижения
                           </Title>
                        </Space>
                     }
                     bodyStyle={{ background: "#fafafa" }}
                  >
                     <Row gutter={[16, 16]}>
                        {author.achievements.map((achievement, index) => (
                           <Col xs={24} sm={12} md={8} lg={6} key={achievement}>
                              <Badge.Ribbon
                                 text={`#${index + 1}`}
                                 color={
                                    achievementIcons[
                                       index % achievementIcons.length
                                    ].color
                                 }
                              >
                                 <Card
                                    hoverable
                                    style={{
                                       height: "100%",
                                       transition: "all 0.3s",
                                       transform: "translateY(0)",
                                       cursor: "default",
                                    }}
                                    className="achievement-card"
                                 >
                                    <div
                                       style={{
                                          display: "flex",
                                          flexDirection: "column",
                                          alignItems: "center",
                                          gap: "16px",
                                       }}
                                    >
                                       <div
                                          style={{
                                             fontSize: "32px",
                                             color: achievementIcons[
                                                index % achievementIcons.length
                                             ].color,
                                             transition: "transform 0.3s",
                                             animation:
                                                "float 3s ease-in-out infinite",
                                          }}
                                       >
                                          {
                                             achievementIcons[
                                                index % achievementIcons.length
                                             ].icon
                                          }
                                       </div>
                                       <Text
                                          strong
                                          style={{
                                             fontSize: "16px",
                                             textAlign: "center",
                                             background: `linear-gradient(45deg, ${
                                                achievementIcons[
                                                   index %
                                                      achievementIcons.length
                                                ].color
                                             }, #333)`,
                                             WebkitBackgroundClip: "text",
                                             WebkitTextFillColor: "transparent",
                                             padding: "8px",
                                          }}
                                       >
                                          {achievement}
                                       </Text>
                                    </div>
                                 </Card>
                              </Badge.Ribbon>
                           </Col>
                        ))}
                     </Row>
                  </Card>
               )}

               <style>
                  {`
                     @keyframes float {
                        0% {
                           transform: translateY(0px);
                        }
                        50% {
                           transform: translateY(-10px);
                        }
                        100% {
                           transform: translateY(0px);
                        }
                     }
                     
                     .achievement-card:hover {
                        transform: translateY(-5px) !important;
                        box-shadow: 0 8px 24px rgba(0,0,0,0.1);
                     }
                  `}
               </style>

               <Tabs defaultActiveKey="books" items={tabItems} />
            </Space>
         </Card>
      </div>
   );
};
