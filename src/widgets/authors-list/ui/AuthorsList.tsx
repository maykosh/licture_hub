import React, { useEffect, useState } from "react";
import { List, Avatar, Card, Typography, Space } from "antd";
import { UserOutlined, TeamOutlined } from "@ant-design/icons";
import { supabase } from "@/shared/supabase/supabaseClient";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/entities/auth";
import { FollowButton } from "@/entities/author/ui/FollowButton";
import { followService } from "@/entities/author/api/followService";

const { Title, Text } = Typography;

interface Author {
   id: string;
   author_name: string;
   avatar_url: string;
   bio: string;
   followersCount: number;
}

interface AuthorsListProps {
   searchQuery: string;
}

const getFollowersText = (count: number): string => {
   const lastDigit = count % 10;
   const lastTwoDigits = count % 100;

   if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
      return "подписчиков";
   }

   if (lastDigit === 1) {
      return "подписчик";
   }

   if (lastDigit >= 2 && lastDigit <= 4) {
      return "подписчика";
   }

   return "подписчиков";
};

export const AuthorsList: React.FC<AuthorsListProps> = ({ searchQuery }) => {
   const [authors, setAuthors] = useState<Author[]>([]);
   const [loading, setLoading] = useState(true);
   const [followingMap, setFollowingMap] = useState<Record<string, boolean>>(
      {}
   );
   const navigate = useNavigate();
   const currentUser = useAuthStore((state) => state.user);

   useEffect(() => {
      const fetchAuthors = async () => {
         try {
            setLoading(true);
            let query = supabase.from("authors").select("*");

            if (searchQuery) {
               query = query.ilike("author_name", `%${searchQuery}%`);
            }

            const { data: authorsData, error } = await query;

            if (error) throw error;

            // Получаем количество подписчиков для каждого автора
            const authorsWithFollowers = await Promise.all(
               (authorsData || []).map(async (author) => {
                  const { count } = await supabase
                     .from("followers")
                     .select("*", { count: "exact", head: true })
                     .eq("author_id", author.id);

                  return {
                     ...author,
                     followersCount: count || 0,
                  };
               })
            );

            setAuthors(authorsWithFollowers);

            // Если есть текущий пользователь, проверяем подписки
            if (currentUser) {
               const followingStatus: Record<string, boolean> = {};
               for (const author of authorsWithFollowers) {
                  if (author.id !== currentUser.uid) {
                     const isFollowing = await followService.isFollowing(
                        currentUser.uid,
                        author.id
                     );
                     followingStatus[author.id] = isFollowing;
                  }
               }
               setFollowingMap(followingStatus);
            }
         } catch (error) {
            console.error("Ошибка при загрузке авторов:", error);
         } finally {
            setLoading(false);
         }
      };

      fetchAuthors();
   }, [searchQuery, currentUser]);

   const handleAuthorClick = (authorId: string) => {
      navigate(`/author/${authorId}`);
   };

   const handleFollowChange = async (
      authorId: string,
      isFollowing: boolean
   ) => {
      setFollowingMap((prev) => ({
         ...prev,
         [authorId]: isFollowing,
      }));

      // Обновляем количество подписчиков у автора
      setAuthors((prevAuthors) =>
         prevAuthors.map((author) =>
            author.id === authorId
               ? {
                    ...author,
                    followersCount:
                       (author.followersCount || 0) + (isFollowing ? 1 : -1),
                 }
               : author
         )
      );
   };

   return (
      <List
         grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 3, xl: 4, xxl: 4 }}
         dataSource={authors}
         loading={loading}
         renderItem={(author) => (
            <List.Item>
               <Card hoverable style={{ height: "100%" }}>
                  <Space
                     direction="vertical"
                     align="center"
                     style={{ width: "100%", gap: "16px" }}
                  >
                     <div
                        style={{
                           position: "relative",
                           cursor: "pointer",
                           transition: "transform 0.3s ease",
                        }}
                        onClick={() => handleAuthorClick(author.id)}
                        onMouseEnter={(e) => {
                           e.currentTarget.style.transform = "scale(1.05)";
                        }}
                        onMouseLeave={(e) => {
                           e.currentTarget.style.transform = "scale(1)";
                        }}
                     >
                        <Avatar
                           size={80}
                           icon={<UserOutlined />}
                           src={author.avatar_url}
                        />
                     </div>
                     <div style={{ textAlign: "center" }}>
                        <Title
                           level={4}
                           onClick={() => handleAuthorClick(author.id)}
                           style={{
                              cursor: "pointer",
                              margin: "0 0 8px 0",
                              transition: "color 0.3s ease",
                           }}
                        >
                           {author.author_name}
                        </Title>
                        <Text
                           type="secondary"
                           style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              fontSize: "0.95rem",
                              marginBottom: "16px",
                              color: "rgba(0, 0, 0, 0.65)",
                           }}
                        >
                           <TeamOutlined style={{ fontSize: "16px" }} />
                           {(author.followersCount || 0).toLocaleString(
                              "ru-RU"
                           )}{" "}
                           {getFollowersText(author.followersCount || 0)}
                        </Text>
                     </div>
                     {currentUser && currentUser.uid !== author.id && (
                        <div
                           style={{
                              width: "100%",
                              display: "flex",
                              justifyContent: "center",
                           }}
                        >
                           <FollowButton
                              authorId={author.id}
                              initialIsFollowing={
                                 followingMap[author.id] || false
                              }
                              onFollowChange={(isFollowing) =>
                                 handleFollowChange(author.id, isFollowing)
                              }
                           />
                        </div>
                     )}
                  </Space>
               </Card>
            </List.Item>
         )}
      />
   );
};
