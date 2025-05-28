import { Role, supabase } from "@/shared";
import { create } from "zustand";

export interface User {
   uid: string;
   name: string;
   role: Role;
   token: string;
   email?: string;
   avatar_url?: string;
}

interface AuthState {
   user: User | null;
   isAuthChecked: boolean;
   setAuth: (user: User) => void;
   clearAuth: () => void;
   setAuthChecked: (value: boolean) => void;
   checkSession: () => Promise<void>;
   logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
   user: null,
   isAuthChecked: false,

   setAuth: (user) => set({ user }),
   clearAuth: () => set({ user: null }),
   setAuthChecked: (value) => set({ isAuthChecked: value }),

   logout: async () => {
      await supabase.auth.signOut();
      set({ user: null });
   },

   checkSession: async () => {
      try {
         const { data, error } = await supabase.auth.getSession();
         console.log("Session data:", data);

         if (error) {
            console.error("Session error:", error);
            set({ user: null, isAuthChecked: true });
            return;
         }

         if (!data.session?.user) {
            console.log("No active session");
            set({ user: null, isAuthChecked: true });
            return;
         }

         const user = data.session.user;

         const { data: userData, error: userError } = await supabase
            .from("users")
            .select("full_name, role_id")
            .eq("id", user.id)
            .single();

         if (userError || !userData) {
            console.error("User data error:", userError);
            set({ user: null, isAuthChecked: true });
            return;
         }

         if (!userData.role_id) {
            console.error("No role_id in user data");
            set({ user: null, isAuthChecked: true });
            return;
         }

         const { data: roleData, error: roleError } = await supabase
            .from("roles")
            .select("name")
            .eq("id", userData.role_id)
            .single();

         if (roleError || !roleData) {
            console.error("Role data error:", roleError);
            set({ user: null, isAuthChecked: true });
            return;
         }

         const authUser = {
            uid: user.id,
            name: userData.full_name,
            role: roleData.name,
            token: data.session.access_token,
            email: user.email,
         };

         console.log("Setting auth user:", authUser);
         set({ user: authUser, isAuthChecked: true });
      } catch (error) {
         console.error("Unexpected error in checkSession:", error);
         set({ user: null, isAuthChecked: true });
      }
   },
}));
