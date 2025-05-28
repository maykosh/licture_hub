import { supabase } from "../supabase/supabaseClient";
import { Role } from "../types/types";

interface LoginResult {
   uid: string;
   name: string;
   role: Role;
   token: string;
}

// === РЕГИСТРАЦИЯ ===
export async function signUp(
   email: string,
   password: string,
   fullName: string,
   roleName: Role
): Promise<LoginResult | null> {
   const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
   });

   if (signUpError || !signUpData.user) {
      console.error("Ошибка регистрации:", signUpError?.message);
      return null;
   }

   const user = signUpData.user;

   // Получаем role_id по имени роли
   const { data: roleData, error: roleError } = await supabase
      .from("roles")
      .select("id")
      .eq("name", roleName)
      .single();

   if (roleError || !roleData) {
      console.error("Ошибка получения роли:", roleError?.message);
      return null;
   }

   // Создаем запись в таблице users
   const { error: userInsertError } = await supabase.from("users").insert({
      id: user.id,
      email: user.email,
      full_name: fullName,
      role_id: roleData.id,
   });

   if (userInsertError) {
      console.error("Ошибка добавления в users:", userInsertError.message);
      return null;
   }

   // Если роль — author, создаём запись в authors
   if (roleName === "author") {
      const { error: authorError } = await supabase.from("authors").insert({
         id: user.id,
         bio: "",
         avatar_url: "",
         banner_url: "",
         achievements: {},
         stats: {},
        author_name: fullName,
      });

      if (authorError) {
         console.error("Ошибка добавления в authors:", authorError.message);
         return null;
      }
   }

   // Получение токена
   const session = signUpData.session;
   const token = session?.access_token || "";

   return {
      uid: user.id,
      name: fullName,
      role: roleName,
      token,
   };
}

// === ЛОГИН ===
export async function signIn(
   email: string,
   password: string
): Promise<LoginResult> {
   const { data: loginData, error: loginError } =
      await supabase.auth.signInWithPassword({ email, password });

   if (loginError || !loginData.session || !loginData.user) {
      throw new Error(loginError?.message || "Ошибка входа");
   }

   const user = loginData.user;
   const token = loginData.session.access_token;

   // Получаем данные из таблицы users
   const { data: userData, error: userError } = await supabase
      .from("users")
      .select("full_name, role_id")
      .eq("id", user.id)
      .single();

   if (userError || !userData) {
      throw new Error("Пользователь не найден в таблице users");
   }

   // Получаем название роли
   const { data: roleData, error: roleFetchError } = await supabase
      .from("roles")
      .select("name")
      .eq("id", userData.role_id)
      .single();

   if (roleFetchError || !roleData) {
      throw new Error("Ошибка получения роли");
   }

   return {
      uid: user.id,
      name: userData.full_name,
      role: roleData.name,
      token,
   };
}
