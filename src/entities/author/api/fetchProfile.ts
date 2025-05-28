import { supabase } from "@/shared/supabase/supabaseClient";
import { useAuthorProfileStore } from "../model/store";

export async function fetchAuthorProfile(authorId: string) {
   const { data, error } = await supabase
      .from("authors")
      .select("*")
      .eq("id", authorId)
      .single();

   const [postsCountRes, booksCountRes, followersCountRes, mediaCountRes] =
      await Promise.all([
         supabase
            .from("posts")
            .select("*", { count: "exact", head: true })
            .eq("author_id", authorId),
         supabase
            .from("books")
            .select("*", { count: "exact", head: true })
            .eq("author_id", authorId),
         supabase
            .from("followers")
            .select("*", { count: "exact", head: true })
            .eq("author_id", authorId),
         supabase
            .from("media")
            .select("*", { count: "exact", head: true })
            .eq("author_id", authorId)
            .eq("media_type", "video"),
      ]);
   if (error) throw new Error("Ошибка загрузки профиля: " + error.message);
   useAuthorProfileStore.getState().setAuthorProfile({
      id: data.id,
      author_name: data.author_name,
      avatar_url: data.avatar_url,
      bio: data.bio,
      achievements: data.achievements || [],
      postsCount: postsCountRes.count || 0,
      booksCount: booksCountRes.count || 0,
      followersCount: followersCountRes.count || 0,
      mediaCount: mediaCountRes.count || 0,
   });
}
export const fetchAuthorPosts = async (authorId: string) => {
   const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("author_id", authorId);
   if (error) throw new Error("Ошибка загрузки постов: " + error.message);
   useAuthorProfileStore.getState().setPosts(data);
};
export const fetchLikeCount = async (
   contentId: string,
   contentType: "post" | "book" | "media"
) => {
   const { count } = await supabase
      .from("likes")
      .select("*", { count: "exact", head: true })
      .eq(`${contentType}_id`, contentId);

   useAuthorProfileStore
      .getState()
      .setLikeCount(contentId, count || 0);
};
