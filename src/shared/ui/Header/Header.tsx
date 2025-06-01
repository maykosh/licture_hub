import { ToggleCollapsed } from "@/features";
import { Button, Avatar, Typography, Tooltip, Dropdown } from "antd";
import {
   LogoutOutlined,
   UserOutlined,
   SettingOutlined,
   QuestionCircleOutlined,
   ClockCircleOutlined,
   CalendarOutlined,
} from "@ant-design/icons";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Title from "antd/es/typography/Title";

const { Text } = Typography;

interface IProps {
   scrolled: boolean;
   handleLogout?: () => void;
   username?: string;
}

export const Header: React.FC<IProps> = ({
   handleLogout,
   scrolled,
   username,
}) => {
   const [currentTime, setCurrentTime] = useState<string>("");
   const [currentDate, setCurrentDate] = useState<string>("");

   useEffect(() => {
      const updateDateTime = () => {
         const now = new Date();

         // Форматирование времени
         const hours = now.getHours().toString().padStart(2, "0");
         const minutes = now.getMinutes().toString().padStart(2, "0");

         // Форматирование даты
         const options: Intl.DateTimeFormatOptions = {
            day: "numeric",
            month: "long",
         };
         const formattedDate = now.toLocaleDateString("ru-RU", options);

         setCurrentTime(`${hours}:${minutes}`);
         setCurrentDate(formattedDate);
      };

      updateDateTime();
      const timer = setInterval(updateDateTime, 30000); // Обновляем каждые 30 секунд
      return () => clearInterval(timer);
   }, []);

   const helpMenu = {
      items: [
         { key: "1", label: "Документация" },
         { key: "2", label: "Обучение" },
         { key: "3", label: "Поддержка" },
      ],
   };

   return (
      <motion.div
         initial={{ y: -20, opacity: 0 }}
         animate={{ y: 0, opacity: 1 }}
         transition={{ duration: 0.3 }}
         className={`w-full h-16 mb-1 p-4 fixed top-0 right-0 left-0 z-50 flex items-center justify-between transition-all duration-300 ${
            scrolled
               ? "bg-white/70 backdrop-blur-md shadow-lg"
               : "bg-gradient-to-r from-white via-white to-white/95"
         }`}
      >
         <div className="flex items-center gap-4">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
               <ToggleCollapsed />
            </motion.div>
            <Title
               level={3}
               style={{
                  margin: 0,
                  background: "linear-gradient(45deg, #1677ff, #69b1ff)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  fontWeight: 600,
               }}
            >
               LiteraryHub
            </Title>
         </div>

         <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center">
               <motion.div
                  className="flex items-center bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 400 }}
               >
                  <div className="flex items-center px-3 py-2 border-r border-gray-100">
                     <ClockCircleOutlined className="text-blue-500 mr-2" />
                     <Text className="font-mono text-gray-700 font-semibold tracking-wider">
                        {currentTime}
                     </Text>
                  </div>
                  <div className="flex items-center px-3 py-2">
                     <CalendarOutlined className="text-blue-500 mr-2" />
                     <Text className="text-gray-600">{currentDate}</Text>
                  </div>
               </motion.div>
            </div>

            <Tooltip title="Справка">
               <Dropdown menu={helpMenu} placement="bottomRight">
                  <Button type="text" icon={<QuestionCircleOutlined />} />
               </Dropdown>
            </Tooltip>

            <Tooltip title="Настройки">
               <Button type="text" icon={<SettingOutlined />} />
            </Tooltip>

            {username && (
               <div className="flex items-center gap-2 mr-2">
                  <Avatar
                     icon={<UserOutlined />}
                     className="bg-blue-500 shadow-md"
                  />
                  <Text strong className="hidden sm:block">
                     {username}
                  </Text>
               </div>
            )}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
               <Button
                  icon={<LogoutOutlined />}
                  onClick={handleLogout}
                  type="primary"
                  danger
                  className="flex items-center shadow-md hover:shadow-lg transition-all duration-300"
                  style={{
                     borderRadius: "8px",
                     background: "linear-gradient(to right, #ff4d4f, #ff7875)",
                  }}
               >
                  Выйти
               </Button>
            </motion.div>
         </div>

         <style>{`
            .ant-btn-dangerous.ant-btn-primary:hover {
               background: linear-gradient(to right, #ff7875, #ff4d4f) !important;
            }
            .ant-input-search {
               border-radius: 8px;
               transition: all 0.3s ease;
            }
            .ant-input-search:hover {
               transform: translateY(-1px);
               box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
         `}</style>
      </motion.div>
   );
};
