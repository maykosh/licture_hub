import { create } from "zustand";
import { IAuthorProfile, IPosts } from "./type";
import { supabase } from "@/shared/supabase/supabaseClient";

interface LikeCounts {
   [key: string]: number;
}

interface AuthorProfileState {
   author: IAuthorProfile | null;
   posts: IPosts[];
   likeCounts: LikeCounts;
   isLoading: boolean;
   setAuthorProfile: (data: IAuthorProfile) => void;
   setPosts: (posts: IPosts[]) => void;
   setLikeCount: (contentId: string, count: number) => void;
   fetchLikeCounts: (authorId: string) => Promise<void>;
   getTotalLikes: () => number;
}

export const useAuthorProfileStore = create<AuthorProfileState>((set, get) => ({
   author: null,
   posts: [],
   likeCounts: {},
   isLoading: false,

   setAuthorProfile: (data) =>
      set((state) => ({
         author: { ...state.author, ...data },
      })),

   setPosts: (posts) => set({ posts }),

   setLikeCount: (contentId, count) =>
      set((state) => ({
         likeCounts: {
            ...state.likeCounts,
            [contentId]: count,
         },
      })),

   fetchLikeCounts: async (authorId: string) => {
      try {
         set({ isLoading: true });

         // Сначала получаем ID контента автора
         const [postsIds, booksIds, mediaIds] = await Promise.all([
            supabase.from("posts").select("id").eq("author_id", authorId),
            supabase.from("books").select("id").eq("author_id", authorId),
            supabase.from("media").select("id").eq("author_id", authorId),
         ]);

         // Затем получаем количество лайков для каждого типа контента
         const [postsLikes, booksLikes, mediaLikes] = await Promise.all([
            Promise.all(
               (postsIds.data || []).map(async (post) => {
                  const { count } = await supabase
                     .from("likes")
                     .select("*", { count: "exact" })
                     .eq("post_id", post.id);
                  return { id: post.id, count: count || 0 };
               })
            ),
            Promise.all(
               (booksIds.data || []).map(async (book) => {
                  const { count } = await supabase
                     .from("likes")
                     .select("*", { count: "exact" })
                     .eq("book_id", book.id);
                  return { id: book.id, count: count || 0 };
               })
            ),
            Promise.all(
               (mediaIds.data || []).map(async (media) => {
                  const { count } = await supabase
                     .from("likes")
                     .select("*", { count: "exact" })
                     .eq("media_id", media.id);
                  return { id: media.id, count: count || 0 };
               })
            ),
         ]);

         const newLikeCounts: LikeCounts = {};
         [...postsLikes, ...booksLikes, ...mediaLikes].forEach(
            ({ id, count }) => {
               newLikeCounts[id] = count;
            }
         );

         set({ likeCounts: newLikeCounts });
      } catch (error) {
         console.error("Ошибка при загрузке лайков:", error);
      } finally {
         set({ isLoading: false });
      }
   },

   getTotalLikes: () => {
      const state = get();
      return Object.values(state.likeCounts).reduce(
         (acc, curr) => acc + curr,
         0
      );
   },
}));
