import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Spin } from "antd";

import { Login, Register, useAuthStore } from "@/entities/auth";
import { AuthorLayout } from "@/widgets";
import {
   AuthorProfile,
   CreatePost,
   FollowersManagement,
   FormAddMedia,
   OtherAuthors,
} from "@/pages";
import { Client } from "@/shared";
import { AuthorView } from "@/pages/author-view";

export const App = () => {
   const { user, isAuthChecked, checkSession } = useAuthStore();

   useEffect(() => {
      checkSession();
   }, []);

   if (!isAuthChecked) {
      // Показываем лоадер, пока не проверили авторизацию
      return (
         <div className="flex justify-center items-center h-screen">
            <Spin size="large" />
         </div>
      );
   }

   if (!isAuthChecked) {
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

   return (
      <Routes>
         <Route path="/login" element={<Login />} />
         <Route path="/register" element={<Register />} />

         {/* Защищённые маршруты для авторов */}
         <Route
            path="/author/*"
            element={
               user?.role === "author" ? (
                  <AuthorLayout />
               ) : (
                  <Navigate to="/login" />
               )
            }
         >
            <Route index element={<AuthorProfile />} />
            <Route path="create-post" element={<CreatePost />} />
            <Route path="create-other" element={<FormAddMedia />} />
            <Route path="other-authors" element={<OtherAuthors />} />
            <Route path=":authorId" element={<AuthorView />} />
            <Route
               path="followers-management"
               element={<FollowersManagement />}
            />
         </Route>

         {/* Роут для читателей */}
         <Route
            path="/reader"
            element={
               user?.role === "reader" ? <Client /> : <Navigate to="/login" />
            }
         />

         {/* Главная страница — редирект по роли */}
         <Route
            path="/"
            element={
               user?.role === "author" ? (
                  <Navigate to="/author" />
               ) : user?.role === "reader" ? (
                  <Navigate to="/reader" />
               ) : (
                  <Navigate to="/login" />
               )
            }
         />
      </Routes>
   );
};
