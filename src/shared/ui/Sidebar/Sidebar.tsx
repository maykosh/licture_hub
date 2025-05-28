import React from "react";
import type { MenuProps } from "antd";
import { Menu } from "antd";
import { AuthorRoutes } from "@/shared/helper/configRoute";
import { useNavigate } from "react-router-dom";

interface IProps {
   collapsed: boolean;
   path: string;
   setCollapsed: (collapsed: boolean) => void;
}

type MenuItem = Required<MenuProps>["items"][number];

export const Sidebar: React.FC<IProps> = ({ collapsed, path }) => {
   const navigate = useNavigate();
   const items: MenuItem[] = AuthorRoutes.map((route) => {
      const cleanedPath = route.path?.replace(/^\/+/, "") || "";

      return {
         key: cleanedPath,
         icon: route.icon,
         label: route.label,
         onClick: () => {
            navigate(`/author/${cleanedPath}`);
         },
      };
   });

   return (
      <div
         style={{
            width: collapsed ? 100 : 256,
            height: "100vh",
            padding: "10px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            transition: "width 0.3s ease-in-out",
            background:"#f9f9f9",
         }}
      >
         <Menu
            selectedKeys={[path]}
            mode="inline"
            theme="light"
            inlineCollapsed={collapsed}
            items={items}
            style={{ 
               display:"flex",
               flexDirection:"column",
               gap:"5px",
               background: "none",
               border: "none"
            }}
         />
      </div>
   );
};
