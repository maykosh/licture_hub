import { supabase } from "@/shared/supabase/supabaseClient";
import { IFollower } from "../model/type";

interface FollowStatus {
   exists: boolean;
}

type FollowError = {
   message: string;
   code?: string;
   details?: string | null;
   hint?: string | null;
};

class FollowService {
   // Проверка сессии пользователя
   private async checkSession() {
      const {
         data: { session },
         error,
      } = await supabase.auth.getSession();
      if (error || !session) {
         throw new Error("Пользователь не аутентифицирован");
      }
   }

   // Проверить, подписан ли пользователь на автора
   async isFollowing(userId: string, authorId: string): Promise<boolean> {
      try {
         await this.checkSession();

         const { data, error } = await supabase
            .from("followers")
            .select("id")
            .eq("user_id", userId)
            .eq("author_id", authorId)
            .maybeSingle();

         if (error && error.code !== "PGRST116") {
            console.error("Ошибка при проверке подписки:", error);
            return false;
         }

         return !!data;
      } catch (error) {
         console.error("Ошибка при проверке подписки:", error);
         return false;
      }
   }

   // Получить статус подписки
   async getFollowStatus(
      userId: string,
      authorId: string
   ): Promise<{ data: FollowStatus | null; error: FollowError | null }> {
      try {
         await this.checkSession();

         const { error } = await supabase
            .from("followers")
            .select("id")
            .eq("user_id", userId)
            .eq("author_id", authorId)
            .single();

         if (error) {
            if (error.code === "PGRST116") {
               // Запись не найдена
               return {
                  data: { exists: false },
                  error: null,
               };
            }
            throw error;
         }

         return {
            data: {
               exists: true,
            },
            error: null,
         };
      } catch (error) {
         console.error("Ошибка при получении статуса подписки:", error);
         return {
            data: null,
            error: error as FollowError,
         };
      }
   }

   // Подписаться на автора
   async follow(userId: string, authorId: string): Promise<IFollower | null> {
      try {
         await this.checkSession();

         // Проверяем, не пытается ли пользователь подписаться на самого себя
         if (userId === authorId) {
            throw new Error("Нельзя подписаться на самого себя");
         }

         // Проверяем, не подписан ли уже пользователь
         const isAlreadyFollowing = await this.isFollowing(userId, authorId);
         if (isAlreadyFollowing) {
            throw new Error("Вы уже подписаны на этого автора");
         }

         const { data, error } = await supabase
            .from("followers")
            .insert([
               {
                  user_id: userId,
                  author_id: authorId,
               },
            ])
            .select()
            .single();

         if (error) {
            if (error.code === "42501") {
               throw new Error("Недостаточно прав для выполнения операции");
            }
            throw error;
         }

         return data;
      } catch (error) {
         console.error("Ошибка при подписке:", error);
         throw error;
      }
   }

   // Отписаться от автора
   async unfollow(userId: string, authorId: string): Promise<boolean> {
      try {
         await this.checkSession();

         const { error } = await supabase
            .from("followers")
            .delete()
            .eq("user_id", userId)
            .eq("author_id", authorId);

         if (error) {
            throw error;
         }

         return true;
      } catch (error) {
         console.error("Ошибка при отписке:", error);
         throw error;
      }
   }

   // Получить количество подписчиков автора
   async getFollowersCount(authorId: string): Promise<number> {
      try {
         const { count, error } = await supabase
            .from("followers")
            .select("*", { count: "exact", head: true })
            .eq("author_id", authorId);

         if (error) {
            throw error;
         }

         return count || 0;
      } catch (error) {
         console.error("Ошибка при получении количества подписчиков:", error);
         return 0;
      }
   }

   // Получить список подписчиков автора
   async getFollowers(authorId: string): Promise<IFollower[]> {
      try {
         const { data, error } = await supabase
            .from("followers")
            .select("*")
            .eq("author_id", authorId);

         if (error) {
            throw error;
         }

         return data || [];
      } catch (error) {
         console.error("Ошибка при получении списка подписчиков:", error);
         return [];
      }
   }
}

export const followService = new FollowService();
