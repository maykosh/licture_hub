import { Avatar, Button, Typography, Space } from "antd";
import {
   EditOutlined,
   EnvironmentOutlined,
   TeamOutlined,
} from "@ant-design/icons";
import { useAuthorProfileStore } from "../model/store";
import React from "react";
import { motion } from "framer-motion";

const { Title, Text } = Typography;

interface IProps {
   onEdit: () => void;
   author_name: string;
   avatar_url: string;
   location?: string;
   followers?: number;
}

export const AuthorHeader: React.FC<IProps> = ({
   author_name,
   avatar_url,
   onEdit,
   location = "Нукус",
   followers = 0,
}) => {
   const author = useAuthorProfileStore((state) => state.author);

   if (!author) return null;

   const containerVariants = {
      hidden: { opacity: 0 },
      visible: {
         opacity: 1,
         transition: {
            duration: 0.5,
            staggerChildren: 0.1,
         },
      },
   };

   const itemVariants = {
      hidden: { opacity: 0, y: 20 },
      visible: {
         opacity: 1,
         y: 0,
         transition: {
            duration: 0.5,
         },
      },
   };

   return (
      <motion.div
         initial="hidden"
         animate="visible"
         variants={containerVariants}
      >
         <div
            style={{
               height: 300,
               position: "relative",
               backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.6)), url(${avatar_url})`,
               backgroundPosition: "center",
               backgroundSize: "cover",
               borderRadius: "16px",
               overflow: "hidden",
               boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
            }}
         >
            {/* Градиентный оверлей для текста */}
            <div
               style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: "100px 5% 30px",
                  background:
                     "linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent)",
               }}
            >
               <motion.div
                  variants={itemVariants}
                  style={{
                     display: "flex",
                     alignItems: "flex-end",
                     gap: 24,
                     flexWrap: "wrap",
                  }}
               >
                  <Avatar
                     size={128}
                     src={avatar_url}
                     style={{
                        border: "4px solid white",
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
                     }}
                  />
                  <div style={{ flex: 1 }}>
                     <Space direction="vertical" size={4}>
                        <motion.div variants={itemVariants}>
                           <Title
                              level={2}
                              style={{ margin: 0, color: "white" }}
                           >
                              {author_name}
                           </Title>
                        </motion.div>
                        <motion.div variants={itemVariants}>
                           <Space size={16} wrap>
                              <Text
                                 style={{ color: "rgba(255, 255, 255, 0.85)" }}
                              >
                                 <Space>
                                    <EnvironmentOutlined />
                                    {location}
                                 </Space>
                              </Text>
                              <Text
                                 style={{ color: "rgba(255, 255, 255, 0.85)" }}
                              >
                                 <Space>
                                    <TeamOutlined />
                                    {followers} подписчиков
                                 </Space>
                              </Text>
                           </Space>
                        </motion.div>
                     </Space>
                  </div>
                  <motion.div variants={itemVariants}>
                     <Button
                        icon={<EditOutlined />}
                        onClick={onEdit}
                        type="primary"
                        size="large"
                        style={{
                           borderRadius: 8,
                           padding: "0 24px",
                           height: 40,
                           boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                        }}
                     >
                        Редактировать
                     </Button>
                  </motion.div>
               </motion.div>
            </div>
         </div>
      </motion.div>
   );
};
