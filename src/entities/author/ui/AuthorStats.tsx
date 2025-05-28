import { Card, Typography, Row, Col, Statistic } from "antd";
import {
   BookOutlined,
   UserOutlined,
   FileTextOutlined,
   VideoCameraOutlined,
} from "@ant-design/icons";
import React from "react";
import { motion } from "framer-motion";

const { Title } = Typography;

interface IProps {
   postsCount: number;
   booksCount: number;
   followersCount: number;
   mediaCount: number;
   totalViews?: number;
}

const statCards = [
   {
      title: "Постов",
      icon: FileTextOutlined,
      color: "#1890ff",
      prefix: "",
      suffix: "",
   },
   {
      title: "Книг",
      icon: BookOutlined,
      color: "#52c41a",
      prefix: "",
      suffix: "",
   },
   {
      title: "Видео",
      icon: VideoCameraOutlined,
      color: "#f5222d",
      prefix: "",
      suffix: "",
   },
   {
      title: "Подписчиков",
      icon: UserOutlined,
      color: "#722ed1",
      prefix: "",
      suffix: "",
   },
];

export const AuthorStats: React.FC<IProps> = ({
   booksCount,
   followersCount,
   postsCount,
   mediaCount,
   totalViews = 0,
}) => {
   const stats = [
      postsCount,
      booksCount,
      mediaCount,
      followersCount,
      totalViews,
   ];

   const containerVariants = {
      hidden: { opacity: 0 },
      show: {
         opacity: 1,
         transition: {
            staggerChildren: 0.1,
         },
      },
   };

   const itemVariants = {
      hidden: { opacity: 0, y: 20 },
      show: {
         opacity: 1,
         y: 0,
         transition: {
            duration: 0.5,
            ease: "easeOut",
         },
      },
   };

   return (
      <motion.div variants={containerVariants} initial="hidden" animate="show">
         <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
            {statCards.map((card, index) => {
               const Icon = card.icon;
               const value = stats[index];

               if (index === 3 && totalViews === 0) return null;

               return (
                  <Col xs={24} sm={12} md={6} key={card.title}>
                     <motion.div variants={itemVariants}>
                        <Card
                           hoverable
                           style={{
                              borderRadius: 16,
                              overflow: "hidden",
                              border: "none",
                              background: `linear-gradient(135deg, ${card.color}15 0%, white 100%)`,
                              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
                           }}
                        >
                           <div style={{ textAlign: "center" }}>
                              <div
                                 style={{
                                    fontSize: 36,
                                    color: card.color,
                                    marginBottom: 16,
                                 }}
                              >
                                 <Icon />
                              </div>
                              <Statistic
                                 title={
                                    <Title
                                       level={5}
                                       style={{
                                          margin: 0,
                                          color: "rgba(0, 0, 0, 0.45)",
                                       }}
                                    >
                                       {card.title}
                                    </Title>
                                 }
                                 value={value}
                                 prefix={card.prefix}
                                 suffix={card.suffix}
                                 valueStyle={{
                                    color: card.color,
                                    fontSize: 24,
                                    fontWeight: "bold",
                                 }}
                              />
                           </div>
                        </Card>
                     </motion.div>
                  </Col>
               );
            })}
         </Row>
      </motion.div>
   );
};
