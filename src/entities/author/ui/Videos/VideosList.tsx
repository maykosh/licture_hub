import React, { useEffect, useState } from "react";
import { Row, Col, Empty, Spin } from "antd";
import { supabase } from "@/shared";
import { VideoCard } from "./VideoCard";
import { useAuthStore } from "@/entities/auth";
import { useAuthorProfileStore } from "../../model/store";

interface Video {
   id: string;
   author_id: string;
   title: string;
   description: string;
   youtube_url: string;
   cover_url?: string;
   media_type: string;
   price: number;
   is_paid: boolean;
   created_at: string;
   likes_count: number;
}

export const VideosList: React.FC = () => {
   const [videos, setVideos] = useState<Video[]>([]);
   const [loading, setLoading] = useState(true);
   const userId = useAuthStore((state) => state.user?.uid);
   const { author, setAuthorProfile, fetchLikeCounts } =
      useAuthorProfileStore();

   const fetchVideos = async () => {
      if (!userId) {
         setLoading(false);
         return;
      }

      try {
         const { data, error } = await supabase
            .from("media")
            .select(
               `
               *,
               likes:likes!likes_media_id_fkey(count)
            `
            )
            .eq("author_id", userId)
            .eq("media_type", "video")
            .order("created_at", { ascending: false });

         if (error) throw error;

         const videosWithLikes =
            data?.map((video) => ({
               ...video,
               likes_count: video.likes?.count || 0,
            })) || [];

         setVideos(videosWithLikes);

         // Обновляем счетчики лайков в сторе
         if (author?.id) {
            await fetchLikeCounts(author.id);
         }
      } catch (error) {
         console.error("Ошибка при загрузке видео:", error);
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      fetchVideos();
   }, [userId]);

   const handleEdit = async () => {
      await fetchVideos();
   };

   const handleDelete = async (id: string) => {
      try {
         const { error } = await supabase.from("media").delete().eq("id", id);

         if (error) throw error;

         setVideos((prevVideos) => {
            const newVideos = prevVideos.filter((video) => video.id !== id);
            if (author) {
               setAuthorProfile({
                  ...author,
                  mediaCount: Math.max(0, author.mediaCount - 1),
               });
            }
            return newVideos;
         });

         // Обновляем счетчики лайков
         if (author?.id) {
            await fetchLikeCounts(author.id);
         }
      } catch (error) {
         console.error("Ошибка при удалении видео:", error);
      }
   };

   if (!userId) {
      return <Empty description="Необходимо авторизоваться" />;
   }

   if (loading) {
      return (
         <div style={{ textAlign: "center", padding: "40px 0" }}>
            <Spin size="large" />
         </div>
      );
   }

   if (videos.length === 0) {
      return <Empty description="У вас пока нет видео" />;
   }

   return (
      <div>
         <Row gutter={[16, 16]}>
            {videos.map((video) => (
               <Col xs={24} sm={12} md={8} lg={6} key={video.id}>
                  <VideoCard
                     {...video}
                     onEdit={handleEdit}
                     onDelete={handleDelete}
                     userId={userId || ""}
                  />
               </Col>
            ))}
         </Row>
      </div>
   );
};
