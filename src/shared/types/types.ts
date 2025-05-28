// login
export type Role = "author" | "reader";
export type LoginData = {
   uid: string;
   email: string | null;
   token: string;
   role: Role;
};

