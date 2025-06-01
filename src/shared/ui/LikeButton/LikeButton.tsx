import React, { useState, useEffect } from "react";
import { Button, message, Tooltip, Drawer, List, Avatar, Space } from "antd";
import { supabase } from "@/shared/supabase/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import styled from "styled-components";
import { LikeOutlined, UserOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

interface LikeButtonProps {
   contentId: string;
   contentType: "post" | "book" | "media";
   initialLikesCount: number;
   userId?: string;
   onLikeChange?: (newLikesCount: number) => void;
   size?: "small" | "middle" | "large";
   showCount?: boolean;
}

interface LikeData {
   user_id: string;
   post_id?: string;
   book_id?: string;
   media_id?: string;
   created_at?: string;
}

interface LikerInfo {
   id: string;
   full_name: string;
   avatar_url?: string;
}

interface SupabaseLike {
   user_id: string;
   users: {
      id: string;
      full_name: string;
      avatar_url?: string;
   };
}

interface StyledButtonProps {
   $isLiked: boolean;
   size?: "small" | "middle" | "large";
}

const StyledButton = styled(Button)<{ $isLiked: boolean }>`
   border: none;
   background: transparent;
   padding: 8px 16px;
   display: flex;
   align-items: center;
   gap: 8px;
   transition: all 0.3s ease;

   &:hover {
      background: ${(props: StyledButtonProps) =>
         props.$isLiked ? "rgba(255, 77, 79, 0.1)" : "rgba(0, 0, 0, 0.05)"};
      transform: translateY(-2px);
   }

   .anticon {
      font-size: ${(props: StyledButtonProps) =>
         props.size === "large"
            ? "24px"
            : props.size === "small"
            ? "16px"
            : "20px"};
      color: ${(props: StyledButtonProps) =>
         props.$isLiked ? "#1677ff" : "inherit"};
   }

   .count {
      font-size: ${(props: StyledButtonProps) =>
         props.size === "large"
            ? "16px"
            : props.size === "small"
            ? "12px"
            : "14px"};
      color: ${(props: StyledButtonProps) =>
         props.$isLiked ? "#1677ff" : "rgba(0, 0, 0, 0.45)"};
   }
`;

export const LikeButton: React.FC<LikeButtonProps> = ({
   contentId,
   contentType,
   initialLikesCount,
   userId,
   onLikeChange,
   size = "middle",
   showCount = true,
}) => {
   const [isLiked, setIsLiked] = useState(false);
   const [likesCount, setLikesCount] = useState(initialLikesCount);
   const [drawerVisible, setDrawerVisible] = useState(false);
   const [likers, setLikers] = useState<LikerInfo[]>([]);
   const [loading, setLoading] = useState(false);
   const navigate = useNavigate();

   useEffect(() => {
      const checkIfLiked = async () => {
         if (!userId) {
            setIsLiked(false);
            return;
         }

         try {
            setLoading(true);
            const idField = `${contentType}_id`;

            // Получаем актуальное количество лайков
            const { count: totalLikes, error: countError } = await supabase
               .from("likes")
               .select("*", { count: "exact" })
               .eq(idField, contentId);

            if (countError) throw countError;

            // Проверяем, лайкнул ли текущий пользователь
            const { data, error: likeError } = await supabase
               .from("likes")
               .select("*")
               .eq("user_id", userId)
               .eq(idField, contentId)
               .maybeSingle();

            if (likeError) throw likeError;

            setIsLiked(!!data);
            setLikesCount(totalLikes || 0);

            if (onLikeChange && totalLikes !== initialLikesCount) {
               onLikeChange(totalLikes || 0);
            }
         } catch (error) {
            console.error("Ошибка при проверке лайка:", error);
            message.error("Не удалось загрузить информацию о лайках");
         } finally {
            setLoading(false);
         }
      };

      checkIfLiked();
   }, [userId, contentId, contentType, initialLikesCount, onLikeChange]);

   const fetchLikers = async (): Promise<void> => {
      try {
         setLoading(true);
         const idField = `${contentType}_id`;

         const { data: likesData, error: likesError } = await supabase
            .from("likes")
            .select(
               `
               user_id,
               users!inner (
                  id,
                  full_name,
                  avatar_url
               )
            `
            )
            .eq(idField, contentId);

         if (likesError) throw likesError;

         if (likesData) {
            const processedLikers: LikerInfo[] = (
               likesData as unknown as SupabaseLike[]
            ).map((like) => ({
               id: like.users.id,
               full_name: like.users.full_name,
               avatar_url: like.users.avatar_url,
            }));
            setLikers(processedLikers);
         }
      } catch (error) {
         console.error("Ошибка при загрузке списка лайков:", error);
         message.error("Не удалось загрузить список лайков");
      } finally {
         setLoading(false);
      }
   };

   const handleLike = async () => {
      if (!userId) {
         message.warning("Необходимо авторизоваться для оценки контента");
         return;
      }

      try {
         setLoading(true);
         const idField = `${contentType}_id`;

         if (isLiked) {
            const { error } = await supabase
               .from("likes")
               .delete()
               .eq("user_id", userId)
               .eq(idField, contentId);

            if (error) throw error;

            const newCount = Math.max(0, likesCount - 1);
            setLikesCount(newCount);
            setIsLiked(false);
            if (onLikeChange) onLikeChange(newCount);
            message.success("Лайк убран");
         } else {
            const likeData: LikeData = {
               user_id: userId,
               [idField]: contentId,
            };

            const { error } = await supabase.from("likes").insert([likeData]);

            if (error) throw error;

            const newCount = likesCount + 1;
            setLikesCount(newCount);
            setIsLiked(true);
            if (onLikeChange) onLikeChange(newCount);
            message.success("Лайк поставлен");
         }
      } catch (error) {
         console.error("Ошибка при обновлении лайка:", error);
         message.error("Произошла ошибка при обновлении лайка");
      } finally {
         setLoading(false);
      }
   };

   const handleContextMenu = async (e: React.MouseEvent) => {
      e.preventDefault(); // Предотвращаем стандартное контекстное меню
      if (likesCount > 0) {
         await fetchLikers();
         setDrawerVisible(true);
      }
   };

   const handleLikerClick = (likerId: string) => {
      navigate(`/author/${likerId}`);
      setDrawerVisible(false);
   };

   return (
      <>
         <Space>
            <Tooltip
               title={
                  userId
                     ? isLiked
                        ? "Убрать лайк"
                        : "Поставить лайк"
                     : "Войдите, чтобы оценить"
               }
            >
               <StyledButton
                  onClick={handleLike}
                  onContextMenu={handleContextMenu}
         
                  size={size}
                  $isLiked={isLiked}
               >
                  <AnimatePresence mode="wait">
                     <motion.div
                        key={isLiked ? "liked" : "unliked"}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                     >
                        <LikeOutlined />
                     </motion.div>
                  </AnimatePresence>
                  {showCount && (
                     <motion.span
                        className="count"
                        key={likesCount}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                     >
                        {likesCount}
                     </motion.span>
                  )}
               </StyledButton>
            </Tooltip>
         </Space>

         <Drawer
            title="Понравилось"
            placement="right"
            onClose={() => setDrawerVisible(false)}
            open={drawerVisible}
            width={320}
         >
            <List
               itemLayout="horizontal"
               dataSource={likers}
               loading={loading}
               renderItem={(liker) => (
                  <List.Item
                     style={{ cursor: "pointer" }}
                     onClick={() => handleLikerClick(liker.id)}
                  >
                     <List.Item.Meta
                        avatar={
                           <Avatar
                              src={liker.avatar_url}
                              icon={<UserOutlined />}
                           />
                        }
                        title={liker.full_name}
                     />
                  </List.Item>
               )}
            />
         </Drawer>
      </>
   );
};
