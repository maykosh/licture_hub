import { useAuthStore } from "@/entities/auth";
import { useToggleCollapsedStore } from "@/features/toggleCollapsed/model/store";
import { Header, Sidebar } from "@/shared";
import { Spin } from "antd";
import React from "react";
import { Outlet, useParams } from "react-router-dom";

export const AuthorLayout: React.FC = () => {
   const collapsed = useToggleCollapsedStore((state) => state.collapsed);
   const setCollapsed = useToggleCollapsedStore((state) => state.setCollapsed);
   const { logout, isAuthChecked } = useAuthStore();
   const path = useParams();

   const [scrolled, setScrolled] = React.useState(false);

   React.useEffect(() => {
      const handleScroll = () => {
         const isScrolled = window.scrollY > 10;
         setScrolled(isScrolled);
      };

      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
   }, []);

   const handleLogout = async () => {
      await logout();
   };
   if (!isAuthChecked) {
      return (
         <div className="flex justify-center items-center h-screen">
            <Spin size="large" />
         </div>
      );
   }
   
   return (
      <div className="flex h-[100vh] ">
         <Sidebar
            collapsed={collapsed}
            path={path["*"] as string}
            setCollapsed={setCollapsed}
         />
         <div className="flex-1 px-[24px] overflow-y-auto">
            <div className="w-full bg-white sticky  p-[5px] top-0 z-10 mb-[100px]">
               <Header scrolled={scrolled} handleLogout={handleLogout} />
            </div>
            <div className="w-full bg-white sticky  p-[5px] top-0  mb-[100px]">
               {<Outlet />}
            </div>
         </div>
      </div>
   );
};
