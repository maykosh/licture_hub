import React, { useState, useEffect } from "react";
import { Button, message } from "antd";
import {
   BellOutlined,
   UserAddOutlined,
   UserDeleteOutlined,
} from "@ant-design/icons";
import { useAuthStore } from "@/entities/auth";
import { followService } from "../../api/followService";
import { IFollowButton } from "../../model/type";
import "./styles.css";

export const FollowButton: React.FC<IFollowButton> = ({
   authorId,
   initialIsFollowing,
   onFollowChange,
}) => {
   const { user } = useAuthStore();
   const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
   const [loading, setLoading] = useState(false);
   const [isHovered, setIsHovered] = useState(false);

   useEffect(() => {
      setIsFollowing(initialIsFollowing);
   }, [initialIsFollowing]);

   const handleFollowClick = async () => {
      if (!user) {
         message.error("Необходимо войти в систему");
         return;
      }

      if (user.uid === authorId) {
         message.warning("Вы не можете подписаться на самого себя");
         return;
      }

      setLoading(true);
      try {
         if (isFollowing) {
            const success = await followService.unfollow(user.uid, authorId);
            if (success) {
               setIsFollowing(false);
               message.success("Вы отписались от автора");
               onFollowChange?.(false);
            }
         } else {
            const result = await followService.follow(user.uid, authorId);
            if (result) {
               setIsFollowing(true);
               message.success("Вы подписались на автора");
               onFollowChange?.(true);
            }
         }
      } catch (error) {
         console.error("Ошибка при изменении подписки:", error);
         message.error("Произошла ошибка. Попробуйте позже");
      } finally {
         setLoading(false);
      }
   };

   return (
      <Button
         className={`follow-button ${isFollowing ? "following" : ""}`}
         type={isFollowing ? "default" : "primary"}
         icon={
            isFollowing ? (
               isHovered ? (
                  <UserDeleteOutlined />
               ) : (
                  <BellOutlined />
               )
            ) : (
               <UserAddOutlined />
            )
         }
         onClick={handleFollowClick}
         loading={loading}
         onMouseEnter={() => setIsHovered(true)}
         onMouseLeave={() => setIsHovered(false)}
         style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            transition: "all 0.3s ease",
            borderRadius: "20px",
            padding: "4px 16px",
            height: "36px",
            fontWeight: 500,
         }}
      >
         {isFollowing
            ? isHovered
               ? "Отписаться"
               : "Вы подписаны"
            : "Подписаться"}
      </Button>
   );
};
