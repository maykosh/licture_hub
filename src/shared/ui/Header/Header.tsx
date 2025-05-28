import { ToggleCollapsed } from "@/features";
import { Button } from "antd";
import { LogoutOutlined } from "@ant-design/icons";
import React from "react";

interface IProps {
   scrolled: boolean;
   handleLogout?: () => void;
}

export const Header: React.FC<IProps> = ({ handleLogout, scrolled }) => {
   return (
      <div
         className={`w-full h-16 mb-1 p-4 fixed top-0 right-0 left-0 z-50 flex items-center justify-between transition-all duration-300 ${
            scrolled ? "bg-white/70 backdrop-blur-md shadow-lg" : "bg-white"
         }`}
      >
         <div className="flex items-center">
            <ToggleCollapsed />
         </div>

         <div className="flex items-center gap-4">
            <Button
               icon={<LogoutOutlined />}
               onClick={handleLogout}
               type="text"
               danger
            >
               Выйти
            </Button>
         </div>
      </div>
   );
};
