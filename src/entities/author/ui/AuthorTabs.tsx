import React, { useState } from "react";
import { Card, Tabs, Modal, message } from "antd";
import { IPosts } from "../model/type";
import { EditPostDrawer } from "./Posts/UpdatePost";
import { supabase } from "@/shared/supabase/supabaseClient";
import { fetchAuthorPosts } from "../api/fetchProfile";
import { useAuthorProfileStore } from "../model/store";
import { BooksList } from "./Books/BooksList";
import { VideosList } from "./Videos/VideosList";
import { PostList } from "./Posts/PostList";

export const AuthorTabs: React.FC<{ posts: IPosts[] }> = ({ posts }) => {
   const [editPost, setEditPost] = useState<IPosts | null>(null);
   const [drawerOpen, setDrawerOpen] = useState(false);

   const { author, likeCounts } = useAuthorProfileStore();

   const handleEdit = (id: string) => {
      const post = posts.find((p) => p.id === id);
      setEditPost(post || null);
      setDrawerOpen(true);
   };

   const handleUpdate = async (updatedPost: IPosts) => {
      const { error } = await supabase
         .from("posts")
         .update({
            title: updatedPost.title,
            content: updatedPost.content,
            poster_url: updatedPost.poster_url,
         })
         .eq("id", updatedPost.id);

      if (error) {
         message.error("Ошибка при обновлении поста");
         return;
      }

      if (author?.id) {
         await fetchAuthorPosts(author.id);
      }
   };

   const handleDelete = async (postId: string) => {
      Modal.confirm({
         title: "Вы уверены, что хотите удалить этот пост?",
         content: "Это действие невозможно отменить.",
         okText: "Удалить",
         okType: "danger",
         cancelText: "Отмена",
         async onOk() {
            const { error } = await supabase
               .from("posts")
               .delete()
               .eq("id", postId);

            if (error) {
               message.error("Ошибка при удалении поста");
               return;
            }

            message.success("Пост удалён");
            if (author?.id) {
               await fetchAuthorPosts(author.id);
            }
         },
      });
   };

   const items = [
      {
         key: "1",
         label: "Посты",
         children: (
            <PostList
               posts={posts}
               handleEdit={handleEdit}
               handleDelete={handleDelete}
               likeCounts={likeCounts}
            />
         ),
      },
      {
         key: "2",
         label: "Книги",
         children: <BooksList />,
      },
      {
         key: "3",
         label: "Видео",
         children: <VideosList />,
      },
   ];

   return (
      <Card>
         <Tabs defaultActiveKey="1" items={items} style={{ padding: "20px" }} />
         <EditPostDrawer
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            post={editPost}
            onUpdate={handleUpdate}
         />
      </Card>
   );
};
