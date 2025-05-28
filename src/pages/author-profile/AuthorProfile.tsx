import { useAuthStore } from "@/entities/auth";
import {
   AuthorAchievements,
   AuthorBio,
   AuthorHeader,
   AuthorStats,
   AuthorTabs,
   fetchAuthorPosts,
   fetchAuthorProfile,
   useAuthorProfileStore,
} from "@/entities/author";
import { AuthorProfileEditor } from "@/features";
import { Spin } from "antd";
import React from "react";

export const AuthorProfile = React.memo(() => {
   const [editOpen, setEditOpen] = React.useState(false);
   const [loading, setLoading] = React.useState(true);
   const { author, posts } = useAuthorProfileStore((state) => state);
   const uid = useAuthStore((state) => state.user?.uid);

   React.useEffect(() => {
      let mounted = true;

      const loadData = async () => {
         if (uid && mounted) {
            try {
               setLoading(true);
               await Promise.all([
                  fetchAuthorProfile(uid),
                  fetchAuthorPosts(uid),
               ]);
            } catch (error) {
               console.error("Ошибка при загрузке данных:", error);
            } finally {
               setLoading(false);
            }
         }
      };

      loadData();

      return () => {
         mounted = false;
      };
   }, [uid]);
   console.log("render");
   if (!uid) return null;

   if (loading) {
      return (
         <div
            style={{
               display: "flex",
               justifyContent: "center",
               alignItems: "center",
               height: "100vh",
            }}
         >
            <Spin size="large" />
         </div>
      );
   }

   if (!author) return null;

   return (
      <div style={{ background: "#f9f9f9", minHeight: "100vh" }}>
         <AuthorHeader
            onEdit={() => setEditOpen(true)}
            author_name={author.author_name}
            avatar_url={author.avatar_url}
            followers={author.followersCount}
         />
         <div style={{ padding: "120px 5% 50px" }}>
            <AuthorStats
               postsCount={author.postsCount}
               booksCount={author.booksCount}
               followersCount={author.followersCount}
               mediaCount={author.mediaCount}
            />
            <AuthorBio bio={author?.bio || ""} />
            <AuthorAchievements achievements={author?.achievements} />
            <AuthorTabs posts={posts} />
         </div>
         <AuthorProfileEditor
            open={editOpen}
            onClose={() => setEditOpen(false)}
            initialData={author}
         />
      </div>
   );
});
