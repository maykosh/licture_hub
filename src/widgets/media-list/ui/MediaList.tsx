import React, { useEffect, useState, useMemo, useCallback } from "react";
import { List, Card, Typography, Space } from "antd";
import { supabase } from "@/shared/supabase/supabaseClient";
import { LikeButton } from "@/shared/ui/LikeButton";
import { useAuthStore } from "@/entities/auth";

const { Title, Text } = Typography;

interface Media {
   id: string;
   title: string;
   description: string;
   youtube_url: string;
   cover_url: string;
   author_name: string;
   author_id: string;
   created_at: string;
   likes_count: number;
   media_type: string;
   is_paid: boolean;
   price: number;
}

interface MediaListProps {
   searchQuery: string;
   authorId?: string;
   filter?: "all" | "popular" | "new" | "trending";
}

const MediaListComponent: React.FC<MediaListProps> = ({
   searchQuery,
   authorId,
   filter = "all",
}) => {
   const [mediaItems, setMediaItems] = useState<Media[]>([]);
   const [loading, setLoading] = useState(true);
   const userId = useAuthStore((state) => state.user?.uid);

   useEffect(() => {
      const fetchMedia = async () => {
         try {
            setLoading(true);
            let query = supabase
               .from("media")
               .select(
                  `
               *,
               authors:author_id (
                 author_name
               ),
               likes:likes!likes_media_id_fkey (
                 count
               )
            `
               )
               .eq("media_type", "video");

            if (searchQuery) {
               query = query.or(
                  `title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`
               );
            }

            if (authorId) {
               query = query.eq("author_id", authorId);
            }

            const { data, error } = await query;

            if (error) throw error;

            let processedMedia =
               data?.map((item) => ({
                  ...item,
                  author_name: item.authors?.author_name,
                  likes_count: item.likes[0]?.count || 0,
               })) || [];

            // Применяем фильтрацию
            switch (filter) {
               case "popular":
                  processedMedia.sort((a, b) => b.likes_count - a.likes_count);
                  processedMedia = processedMedia.slice(0, 10); // Топ 10 популярных
                  break;
               case "new":
                  processedMedia.sort(
                     (a, b) =>
                        new Date(b.created_at).getTime() -
                        new Date(a.created_at).getTime()
                  );
                  break;
               case "trending": // Для трендовых видео можно использовать комбинацию лайков и времени
               {
                  const now = new Date().getTime();
                  const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000; // 7 дней назад
                  processedMedia = processedMedia
                     .filter(
                        (item) =>
                           new Date(item.created_at).getTime() > oneWeekAgo
                     )
                     .sort((a, b) => b.likes_count - a.likes_count);
                  break;
               }
               default:
                  // Для 'all' не применяем дополнительную фильтрацию
                  break;
            }

            setMediaItems(processedMedia);
         } catch (error) {
            console.error("Ошибка при загрузке видео:", error);
         } finally {
            setLoading(false);
         }
      };

      fetchMedia();
   }, [searchQuery, authorId, filter]);

   const getYouTubeEmbedUrl = (url: string) => {
      try {
         // Поддержка разных форматов URL
         const urlObj = new URL(url);
         let videoId = "";

         if (urlObj.hostname === "youtu.be") {
            // Формат: https://youtu.be/VIDEO_ID
            videoId = urlObj.pathname.slice(1);
         } else if (urlObj.hostname.includes("youtube.com")) {
            if (urlObj.pathname === "/watch") {
               // Формат: https://www.youtube.com/watch?v=VIDEO_ID
               videoId = urlObj.searchParams.get("v") || "";
            } else if (urlObj.pathname.startsWith("/embed/")) {
               // Формат: https://www.youtube.com/embed/VIDEO_ID
               videoId = urlObj.pathname.split("/embed/")[1];
            }
         }

         if (!videoId) {
            throw new Error("Invalid YouTube URL");
         }

         return `https://www.youtube.com/embed/${videoId}`;
      } catch (error) {
         console.error("Error parsing YouTube URL:", error);
         return "";
      }
   };

   const handleLikeChange = useCallback((mediaId: string, newCount: number) => {
      setMediaItems((prevItems) =>
         prevItems.map((m) =>
            m.id === mediaId ? { ...m, likes_count: newCount } : m
         )
      );
   }, []);

   const renderedList = useMemo(
      () => (
         <List
            grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 3, xl: 3, xxl: 4 }}
            dataSource={mediaItems}
            loading={loading}
            renderItem={(media) => (
               <List.Item>
                  <Card
                     hoverable
                     style={{
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
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
                           }}
                        >
                           <iframe
                              style={{
                                 position: "absolute",
                                 top: 0,
                                 left: 0,
                                 width: "100%",
                                 height: "100%",
                                 border: "none",
                              }}
                              src={getYouTubeEmbedUrl(media.youtube_url)}
                              title={media.title}
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                           />
                        </div>
                        <div style={{ flex: 1 }}>
                           <Title
                              level={4}
                              ellipsis={{ rows: 2 }}
                              style={{ marginBottom: 8, minHeight: "3em" }}
                           >
                              {media.title}
                           </Title>
                           <Text
                              style={{
                                 WebkitLineClamp: 2,
                                 display: "-webkit-box",
                                 WebkitBoxOrient: "vertical",
                                 overflow: "hidden",
                                 marginBottom: 8,
                                 minHeight: "3em",
                              }}
                           >
                              {media.description}
                           </Text>
                        </div>
                        <Space direction="vertical" style={{ width: "100%" }}>
                           <div
                              style={{
                                 display: "flex",
                                 justifyContent: "space-between",
                                 alignItems: "center",
                              }}
                           >
                              <Text>Автор: {media.author_name}</Text>
                              <Space>
                                 <Text type="secondary">
                                    {new Date(
                                       media.created_at
                                    ).toLocaleDateString("ru-RU")}
                                 </Text>
                                 <LikeButton
                                    contentId={media.id}
                                    contentType="media"
                                    initialLikesCount={media.likes_count}
                                    userId={userId}
                                    size="small"
                                    onLikeChange={(newCount) =>
                                       handleLikeChange(media.id, newCount)
                                    }
                                 />
                              </Space>
                           </div>
                        </Space>
                     </Space>
                  </Card>
               </List.Item>
            )}
         />
      ),
      [mediaItems, loading, userId, handleLikeChange]
   );

   return renderedList;
};
export const MediaList = React.memo(MediaListComponent);
MediaList.displayName = "MediaList";
