import { CgProfile } from "react-icons/cg";
import React, { useState, useEffect } from "react";
import {
   Layout,
   Menu,
   Input,
   Avatar,
   Space,
   Typography,
   Badge,
   Button,
   Dropdown,
   Tooltip,
} from "antd";
import {
   BookOutlined,
   VideoCameraOutlined,
   UserOutlined,
   MessageOutlined,
   BellOutlined,
   SettingOutlined,
   LogoutOutlined,
   MenuFoldOutlined,
   MenuUnfoldOutlined,
   HomeOutlined,
   TeamOutlined,
   SearchOutlined,
   CloseOutlined,
} from "@ant-design/icons";
import { PostsList } from "@/widgets/posts-list/ui/PostsList";
import { BooksList } from "@/widgets/books-list/ui/BooksList";
import { MediaList } from "@/widgets/media-list/ui/MediaList";
import { AuthorsList } from "@/widgets/authors-list/ui/AuthorsList";
import { useAuthStore } from "@/entities/auth";
import { ProfileSettingsPage } from "@/pages/profile-settings/ProfileSettingsPage";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/shared/supabase/supabaseClient";
import { FollowersManagement } from "@/pages/followers-management/FollowersManagement";
import { SubscriptionsManagement } from "@/widgets/subscriptions-management";

const { Header, Content, Sider } = Layout;
const { Title, Text } = Typography;

type FilterType = "all" | "popular" | "new";

interface User {
   uid: string;
   email?: string;
   avatar_url?: string;
   full_name?: string;
   role_id?: string;
}

export const ClientLayout: React.FC = () => {
   const [selectedMenu, setSelectedMenu] = useState("posts");
   const [searchQuery, setSearchQuery] = useState("");
   const [filter, setFilter] = useState<FilterType>("all");
   const [collapsed, setCollapsed] = useState(false);
   const [isSearchVisible, setIsSearchVisible] = useState(false);
   const [currentUser, setCurrentUser] = useState<User | null>(null);
   const { logout, user } = useAuthStore();

   useEffect(() => {
      const fetchCurrentUser = async () => {
         if (!user) {
            setCurrentUser(null);
            return;
         }

         try {
            const { data: userData, error } = await supabase
               .from("users")
               .select("*")
               .eq("id", user.uid)
               .single();

            if (error) throw error;

            setCurrentUser({
               ...user,
               ...userData,
            });
         } catch (error) {
            console.error("Ошибка при получении данных пользователя:", error);
         }
      };

      fetchCurrentUser();
   }, [user]);

   useEffect(() => {
      const handleResize = () => {
         if (window.innerWidth > 768) {
            setIsSearchVisible(false);
         }
      };

      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
   }, []);

   const renderContent = () => {
      switch (selectedMenu) {
         case "posts":
            return <PostsList searchQuery={searchQuery} filter={filter} />;
         case "books":
            return <BooksList searchQuery={searchQuery} filter={filter} />;
         case "media":
            return <MediaList searchQuery={searchQuery} filter={filter} />;
         case "authors":
            return <AuthorsList searchQuery={searchQuery} filter={filter} />;
         case "settings":
            return <ProfileSettingsPage />;
         case "subscriptions":
            return currentUser?.role_id === "author" ? (
               <FollowersManagement />
            ) : (
               <SubscriptionsManagement userId={currentUser?.uid} />
            );
         default:
            return <PostsList searchQuery={searchQuery} filter={filter} />;
      }
   };

   const userMenuItems = [
      {
         key: "profile",
         icon: <SettingOutlined />,
         label: "Настройки профиля",
         onClick: () => setSelectedMenu("settings"),
      },
      {
         key: "logout",
         icon: <LogoutOutlined />,
         label: "Выйти",
         onClick: () => logout(),
      },
   ];

   const handleMenuClick = (key: string) => {
      setSelectedMenu(key);
      // Закрываем сайдбар только на мобильных устройствах
      if (window.innerWidth <= 768) {
         setCollapsed(true);
      }
   };

   const menuItems = [
      {
         key: "posts",
         icon: <HomeOutlined />,
         label: "Посты",
      },
      {
         key: "books",
         icon: <BookOutlined />,
         label: "Книги",
      },
      {
         key: "media",
         icon: <VideoCameraOutlined />,
         label: "Медиа",
      },
      {
         key: "authors",
         icon: <UserOutlined />,
         label: "Авторы",
      },
      {
         key: "subscriptions",
         icon: <TeamOutlined />,
         label: "Мои подписки",
      },
      {
         key: "settings",
         icon: <CgProfile />,
         label: "Профиль",
      },
   ];

   return (
      <Layout style={{ minHeight: "100vh", background: "#f5f7fa" }}>
         <Header
            style={{
               padding: "0 16px",
               background: "rgba(255, 255, 255, 0.95)",
               backdropFilter: "blur(10px)",
               boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
               position: "fixed",
               width: "100%",
               zIndex: 1000,
               display: "flex",
               alignItems: "center",
               justifyContent: "space-between",
               transition: "all 0.3s ease",
               height: "72px",
            }}
         >
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
               <Button
                  type="text"
                  icon={
                     collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />
                  }
                  onClick={() => setCollapsed(!collapsed)}
                  style={{
                     fontSize: "18px",
                     width: 48,
                     height: 48,
                     borderRadius: "12px",
                     display: "flex",
                     alignItems: "center",
                     justifyContent: "center",
                  }}
               />
               <Title
                  level={3}
                  className="site-title"
                  style={{
                     margin: 0,
                     background: "linear-gradient(45deg, #1677ff, #69b1ff)",
                     WebkitBackgroundClip: "text",
                     WebkitTextFillColor: "transparent",
                     fontWeight: 600,
                     fontSize: "1.5rem",
                  }}
               >
                  LiteraryHub
               </Title>
               <div
                  className={`search-container ${
                     isSearchVisible ? "search-visible" : ""
                  }`}
               >
                  <div className="search-wrapper">
                     <Input
                        prefix={<SearchOutlined style={{ color: "#1677ff" }} />}
                        placeholder="Поиск..."
                        allowClear
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                           width: 300,
                           borderRadius: "12px",
                           padding: "8px 12px",
                           backgroundColor: "rgba(0, 0, 0, 0.02)",
                           border: "1px solid rgba(0, 0, 0, 0.06)",
                        }}
                        className="search-input"
                     />
                     <Button
                        type="text"
                        icon={<CloseOutlined />}
                        className="search-close-button"
                        onClick={() => setIsSearchVisible(false)}
                     />
                  </div>
               </div>
            </div>
            <Space size={16} className="header-controls">
               <Button
                  type="text"
                  icon={<SearchOutlined />}
                  className="mobile-search-button"
                  onClick={() => setIsSearchVisible(!isSearchVisible)}
                  style={{
                     width: 48,
                     height: 48,
                     borderRadius: "12px",
                     fontSize: "20px",
                  }}
               />
               <Tooltip title="Уведомления">
                  <Badge count={5} size="small">
                     <Button
                        type="text"
                        icon={<BellOutlined />}
                        className="header-button"
                        style={{
                           width: 48,
                           height: 48,
                           borderRadius: "12px",
                           fontSize: "20px",
                        }}
                     />
                  </Badge>
               </Tooltip>
               <Tooltip title="Сообщения">
                  <Badge count={2} size="small">
                     <Button
                        type="text"
                        icon={<MessageOutlined />}
                        className="header-button"
                        style={{
                           width: 48,
                           height: 48,
                           borderRadius: "12px",
                           fontSize: "20px",
                        }}
                     />
                  </Badge>
               </Tooltip>
               <Dropdown
                  menu={{ items: userMenuItems }}
                  placement="bottomRight"
                  arrow
               >
                  <Space style={{ cursor: "pointer" }}>
                     <Space direction="vertical" size={0}>
                        <Text
                           strong
                           className="user-name"
                           style={{ fontSize: "14px" }}
                        >
                           {currentUser?.full_name || "Пользователь"}
                        </Text>
                     </Space>
                     <Avatar
                        size={34}
                        icon={<UserOutlined />}
                        src={currentUser?.avatar_url}
                        style={{
                           border: "2px solid #1677ff",
                           padding: 2,
                           backgroundColor: "#f0f5ff",
                        }}
                        className="user-avatar"
                     />
                  </Space>
               </Dropdown>
            </Space>
         </Header>

         <Layout style={{ marginTop: 72 }}>
            <Sider
               width={240}
               // className="main-sider"
               style={{
                  background: "rgba(255, 255, 255, 0.95)",
                  backdropFilter: "blur(30px)",
                  position: "fixed",
                  height: "calc(100vh - 72px)",
                  left: 0,
                  top: 72,
                  bottom: 0,
                  boxShadow: "2px 0 8px rgba(0,0,0,0.03)",
                  zIndex: 999,
                  transition: "all 0.3s cubic-bezier(0.2, 0, 0, 1)",
                  borderRight: "1px solid rgba(0, 0, 0, 0.06)",
               }}
               collapsible
               collapsed={collapsed}
               trigger={null}
               breakpoint="lg"
               collapsedWidth={0}
               onBreakpoint={(broken) => {
                  if (!broken) {
                     setCollapsed(false);
                  }
               }}
            >
               <Menu
                  mode="inline"
                  selectedKeys={[selectedMenu]}
                  style={{
                     height: "100%",
                     borderRight: 0,
                     padding: "16px 8px",
                     background: "transparent",
                  }}
                  onSelect={({ key }) => handleMenuClick(key)}
                  items={menuItems}
               />
            </Sider>

            <Layout
               className="main-content-layout"
               style={{
                  padding: "24px",
                  marginLeft: collapsed ? 0 : 240,
                  transition: "all 0.3s cubic-bezier(0.2, 0, 0, 1)",
                  background: "transparent",
               }}
            >
               <Content
                  className="main-content"
                  style={{
                     background: "rgba(255, 255, 255, 0.95)",
                     backdropFilter: "blur(10px)",
                     padding: 24,
                     margin: 0,
                     borderRadius: "16px",
                     minHeight: 280,
                     boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                     border: "1px solid rgba(0, 0, 0, 0.06)",
                  }}
               >
                  <AnimatePresence mode="wait">
                     <motion.div
                        key={selectedMenu}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                     >
                        <div
                           style={{
                              marginBottom: 24,
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                           }}
                        >
                           <Title
                              level={4}
                              style={{
                                 margin: 0,
                                 fontSize: "24px",
                                 fontWeight: 600,
                                 background:
                                    "linear-gradient(45deg, #1677ff, #69b1ff)",
                                 WebkitBackgroundClip: "text",
                                 WebkitTextFillColor: "transparent",
                              }}
                           >
                              {selectedMenu === "posts" && "Посты"}
                              {selectedMenu === "books" && "Книги"}
                              {selectedMenu === "media" && "Медиа"}
                              {selectedMenu === "authors" && "Авторы"}
                              {selectedMenu === "favorites" && "Избранное"}
                              {selectedMenu === "settings" &&
                                 "Настройки профиля"}
                              {selectedMenu === "subscriptions" &&
                                 "Мои подписки"}
                           </Title>
                           <Space>
                              {selectedMenu !== "settings" && (
                                 <>
                                    <Button
                                       type={
                                          filter === "all"
                                             ? "primary"
                                             : "default"
                                       }
                                       onClick={() => setFilter("all")}
                                       className="filter-button"
                                       style={{
                                          borderRadius: "12px",
                                          height: "40px",
                                          padding: "0 20px",
                                       }}
                                    >
                                       Все
                                    </Button>
                                    <Button
                                       type={
                                          filter === "popular"
                                             ? "primary"
                                             : "default"
                                       }
                                       onClick={() => setFilter("popular")}
                                       className="filter-button"
                                       style={{
                                          borderRadius: "12px",
                                          height: "40px",
                                          padding: "0 20px",
                                       }}
                                    >
                                       Популярные
                                    </Button>
                                    <Button
                                       type={
                                          filter === "new"
                                             ? "primary"
                                             : "default"
                                       }
                                       onClick={() => setFilter("new")}
                                       className="filter-button"
                                       style={{
                                          borderRadius: "12px",
                                          height: "40px",
                                          padding: "0 20px",
                                       }}
                                    >
                                       Новые
                                    </Button>
                                 </>
                              )}
                           </Space>
                        </div>
                        {renderContent()}
                     </motion.div>
                  </AnimatePresence>
               </Content>
            </Layout>
         </Layout>

         <style>
            {`
               .site-title {
                  display: block;
               }

               .search-container {
                  position: relative;
                  transition: all 0.3s ease;
               }

               .search-wrapper {
                  position: relative;
                  display: flex;
                  align-items: center;
                  gap: 8px;
               }

               .search-input {
                  transition: all 0.3s ease;
               }

               .search-close-button {
                  display: none;
               }

               .mobile-search-button {
                  display: none;
               }

               @media screen and (max-width: 768px) {
                  .search-container {
                     position: fixed;
                     top: 72px;
                     left: 0;
                     right: 0;
                     background: rgba(255, 255, 255, 0.95);
                     padding: 16px;
                     transform: translateY(-100%);
                     opacity: 0;
                     visibility: hidden;
                     transition: all 0.3s cubic-bezier(0.2, 0, 0, 1);
                     z-index: 998;
                     box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                     backdrop-filter: blur(10px);
                  }

                  .search-container.search-visible {
                     transform: translateY(0);
                     opacity: 1;
                     visibility: visible;
                  }

                  .search-wrapper {
                     max-width: 600px;
                     margin: 0 auto;
                  }

                  .search-input {
                     width: 100% !important;
                  }

                  .search-close-button {
                     display: flex;
                     align-items: center;
                     justify-content: center;
                     width: 40px;
                     height: 40px;
                     border-radius: 50%;
                     transition: all 0.3s ease;
                     color: #666;
                  }

                  .search-close-button:hover {
                     background: rgba(0, 0, 0, 0.05);
                     color: #1677ff;
                  }

                  .mobile-search-button {
                     display: flex;
                  }

                  .site-title {
                     display: none;
                  }
               }

               @media screen and (max-width: 576px) {
                  .site-title {
                     display: none;
                  }

                  .user-name {
                     display: none;
                  }

                  .header-button {
                     width: 40px !important;
                     height: 40px !important;
                     font-size: 18px !important;
                  }

                  .header-controls {
                     gap: 8px !important;
                  }

                  .filter-button {
                     padding: 0 8px !important;
                     height: 32px !important;
                  }
               }

               @media screen and (max-width: 375px) {
                  .filter-button {
                     min-width: auto !important;
                  }
               }

               .ant-menu-item {
                  margin: 8px !important;
                  width: calc(100% - 16px) !important;
                  border-radius: 12px;
                  height: 48px !important;
                  line-height: 48px !important;
                  font-weight: 500;
               }

               .ant-menu-item:hover {
                  transform: translateX(4px);
                  transition: all 0.3s ease;
                  background-color: rgba(22, 119, 255, 0.1) !important;
               }

               .ant-menu-item-selected {
                  background: linear-gradient(45deg, #1677ff, #69b1ff) !important;
                  color: white !important;
                  font-weight: 600;
               }

               .ant-menu-item-selected:hover {
                  background: linear-gradient(45deg, #1677ff, #69b1ff) !important;
                  color: white !important;
                  transform: translateX(4px) scale(1.02);
               }

               .header-button {
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  transition: all 0.3s ease;
                  background: transparent;
               }

               .header-button:hover {
                  background: rgba(22, 119, 255, 0.1);
                  transform: translateY(-2px);
                  color: #1677ff;
               }

               .user-avatar {
                  transition: all 0.3s ease;
               }

               .user-avatar:hover {
                  transform: scale(1.05);
                  border-color: #69b1ff;
               }

               .filter-button {
                  transition: all 0.3s ease;
                  font-weight: 500;
               }

               .filter-button:hover {
                  transform: translateY(-2px);
                  box-shadow: 0 4px 12px rgba(22, 119, 255, 0.2);
               }

               .ant-input-affix-wrapper {
                  transition: all 0.3s ease;
                  border-radius: 12px !important;
               }

               .ant-input-affix-wrapper:hover,
               .ant-input-affix-wrapper-focused {
                  transform: translateY(-2px);
                  box-shadow: 0 4px 12px rgba(22, 119, 255, 0.1) !important;
                  border-color: #1677ff !important;
               }

               .ant-layout-sider {
                  background: transparent !important;
               }

               .ant-layout-content {
                  transition: all 0.3s ease;
               }

               .ant-layout-content:hover {
                  transform: translateY(-2px);
                  box-shadow: 0 8px 24px rgba(22, 119, 255, 0.1);
               }

               .ant-dropdown-trigger:hover .user-avatar {
                  border-color: #69b1ff;
                  transform: scale(1.05);
               }

               .main-sider {
                  transform: translateX(0);
               }

               .ant-layout-sider-collapsed {
                  transform: translateX(-100%);
               }

               @media screen and (max-width: 768px) {
                  .main-sider {
                     transform: translateX(-240px);
                  }

                  .main-sider.ant-layout-sider-collapsed {
                     transform: translateX(0);
                  }

                  .main-content-layout {
                     padding: 16px !important;
                     margin-left: 0 !important;
                     transform: translateX(0);
                  }

                  .main-sider.ant-layout-sider-collapsed ~ .main-content-layout {
                     transform: translateX(240px);
                  }

                  .main-content {
                     padding: 16px !important;
                     border-radius: 12px !important;
                  }

                  .filter-button {
                     padding: 0 12px !important;
                     font-size: 12px !important;
                  }
               }

               .ant-layout-sider,
               .main-content-layout {
                  will-change: transform;
                  backface-visibility: hidden;
                  perspective: 1000;
               }

               .ant-layout-has-sider {
                  overflow-x: hidden;
               }
            `}
         </style>
      </Layout>
   );
};
