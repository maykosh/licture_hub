import React from "react";
import {
   Card,
   Row,
   Col,
   Typography,
   Statistic,
   Space,
   Progress,
   Tag,
} from "antd";
import {
   BookOutlined,
   LikeOutlined,
   PlayCircleOutlined,
   UserOutlined,
   CrownOutlined,
   VideoCameraOutlined,
} from "@ant-design/icons";
import { useAuthorProfileStore } from "../model/store";

const { Title, Text } = Typography;

interface AuthorAchievementsProps {
   achievements?: string[];
}

export const AuthorAchievements: React.FC<AuthorAchievementsProps> = ({
   achievements = [],
}) => {
   const { author, getTotalLikes, fetchLikeCounts, isLoading } =
      useAuthorProfileStore();

   React.useEffect(() => {
      let mounted = true;

      const loadLikes = async () => {
         if (author?.id && mounted) {
            await fetchLikeCounts(author.id);
         }
      };

      loadLikes();

      // Устанавливаем интервал для периодического обновления лайков
      const interval = setInterval(loadLikes, 30000); // Обновляем каждые 30 секунд

      return () => {
         mounted = false;
         clearInterval(interval);
      };
   }, [author?.id, fetchLikeCounts]);

   if (!author) return null;

   const totalLikes = getTotalLikes();

   const isAchievementsArray = Array.isArray(achievements) ? achievements : [];

   const achievementLevels = {
      writer: Math.min(((author.booksCount || 0) / 10) * 100, 100),
      videoBlogger: Math.min(((author.mediaCount || 0) / 5) * 100, 100),
      contentMaker: Math.min(((author.postsCount || 0) / 5) * 100, 100),
      publicFavorite: Math.min((totalLikes / 100) * 100, 100),
      popularAuthor: Math.min(((author.followersCount || 0) / 50) * 100, 100),
   };


   const statsAchievements = [
      {
         icon: <BookOutlined />,
         title: "Писатель",
         description: `Опубликовано ${author.booksCount || 0} книг`,
         progress: achievementLevels.writer,
         color: "#1890ff",
      },
      {
         icon: <VideoCameraOutlined />,
         title: "Видеоблогер",
         description: `Создано ${author.mediaCount || 0} видео`,
         progress: achievementLevels.videoBlogger,
         color: "#f5222d",
      },
      {
         icon: <PlayCircleOutlined />,
         title: "Контент-мейкер",
         description: `Создано ${author.postsCount || 0} постов`,
         progress: achievementLevels.contentMaker,
         color: "#722ed1",
      },
      {
         icon: <LikeOutlined />,
         title: "Любимчик публики",
         description: `Получено ${totalLikes} лайков`,
         progress: achievementLevels.publicFavorite,
         color: "#fa8c16",
      },
      {
         icon: <UserOutlined />,
         title: "Популярный автор",
         description: `${author.followersCount || 0} подписчиков`,
         progress: achievementLevels.popularAuthor,
         color: "#13c2c2",
      },
   ];

   return (
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
         <Card>
            <Row gutter={[24, 24]}>
               <Col xs={24} sm={8}>
                  <Statistic
                     title="Подписчиков"
                     value={author.followersCount || 0}
                     prefix={<UserOutlined />}
                  />
               </Col>
               <Col xs={24} sm={8}>
                  <Statistic
                     title="Видео"
                     value={author.mediaCount || 0}
                     prefix={<VideoCameraOutlined />}
                  />
               </Col>
               <Col xs={24} sm={8}>
                  <Statistic
                     title="Общий рейтинг"
                     value={totalLikes}
                     prefix={<LikeOutlined />}
                     loading={isLoading}
                  />
               </Col>
            </Row>
         </Card>

         <Title level={4} style={{ margin: "20px 0" }}>
            Достижения
         </Title>

         <Row gutter={[16, 16]}>
            {statsAchievements.map((achievement, index) => (
               <Col xs={24} sm={12} md={6} key={`stat-${index}`}>
                  <Card
                     hoverable
                     style={{
                        background: `linear-gradient(135deg, white 0%, ${achievement.color}15 100%)`,
                        transition: "all 0.3s ease",
                        cursor: "pointer",
                     }}
                     className="achievement-card"
                  >
                     <Space
                        direction="vertical"
                        size="small"
                        style={{ width: "100%" }}
                     >
                        <div
                           style={{
                              fontSize: "32px",
                              color: achievement.color,
                           }}
                        >
                           {achievement.icon}
                        </div>
                        <Title level={5} style={{ margin: "8px 0" }}>
                           {achievement.title}
                        </Title>
                        <Text type="secondary">{achievement.description}</Text>
                        <Progress
                           percent={achievement.progress}
                           strokeColor={achievement.color}
                           size="small"
                           showInfo={false}
                        />
                        <Tag color={achievement.color} style={{ marginTop: 8 }}>
                           {achievement.progress === 100
                              ? "Получено!"
                              : "В процессе"}
                        </Tag>
                     </Space>
                  </Card>
               </Col>
            ))}

            {isAchievementsArray?.map((achievement, index) => (
               <Col xs={24} sm={12} md={6} key={`text-${index}`}>
                  <Card
                     hoverable
                     style={{
                        background:
                           "linear-gradient(135deg, white 0%, #52c41a15 100%)",
                        transition: "all 0.3s ease",
                        cursor: "pointer",
                     }}
                     className="achievement-card"
                  >
                     <Space
                        direction="vertical"
                        size="small"
                        style={{ width: "100%" }}
                     >
                        <div
                           style={{
                              fontSize: "32px",
                              color: "#52c41a",
                           }}
                        >
                           <CrownOutlined />
                        </div>
                        <Title level={5} style={{ margin: "8px 0" }}>
                           Особое достижение
                        </Title>
                        <Text type="secondary">{achievement}</Text>
                        <Tag color="#52c41a" style={{ marginTop: 8 }}>
                           Получено!
                        </Tag>
                     </Space>
                  </Card>
               </Col>
            ))}
         </Row>

         <style>
            {`
            .achievement-card:hover {
               transform: translateY(-5px);
               box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            }
            `}
         </style>
      </Space>
   );
};
