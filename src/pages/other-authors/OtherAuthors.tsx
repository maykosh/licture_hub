import React, { useState } from "react";
import { Tabs, Card, Input, Typography, Space, Row, Col, Select } from "antd";
import {
   SearchOutlined,
   UserOutlined,
   BookOutlined,
   PlayCircleOutlined,
   FileTextOutlined,
   FireOutlined,
   StarOutlined,
   ClockCircleOutlined,
} from "@ant-design/icons";
import { AuthorsList } from "@/widgets/authors-list";
import { BooksList } from "@/widgets/books-list";
import { MediaList } from "@/widgets/media-list";
import { PostsList } from "@/widgets/posts-list";
import { motion } from "framer-motion";

const { Title } = Typography;
const { Option } = Select;

type AuthorFilterType = "all" | "popular" | "new" | "featured";
type BookFilterType = "all" | "popular" | "new" | "topRated";
type MediaFilterType = "all" | "popular" | "new" | "trending";
type PostFilterType = "all" | "popular" | "new" | "mostLiked";

interface FilterOption<T> {
   value: T;
   label: string;
   icon: React.ReactNode;
}

interface FilterSelectProps<T> {
   value: T;
   onChange: (value: T) => void;
   options: FilterOption<T>[];
   style?: React.CSSProperties;
}

export const OtherAuthors: React.FC = () => {
   const [searchQuery, setSearchQuery] = useState("");
   const [authorFilter, setAuthorFilter] = useState<AuthorFilterType>("all");
   const [bookFilter, setBookFilter] = useState<BookFilterType>("all");
   const [mediaFilter, setMediaFilter] = useState<MediaFilterType>("all");
   const [postFilter, setPostFilter] = useState<PostFilterType>("all");

   const handleSearch = (value: string) => {
      setSearchQuery(value);
   };

   const FilterSelect = <T extends string>({
      value,
      onChange,
      options,
      style = {},
   }: FilterSelectProps<T>) => (
      <Select
         value={value}
         onChange={onChange}
         style={{ width: 200, ...style }}
         size="middle"
      >
         {options.map((opt) => (
            <Option key={opt.value} value={opt.value}>
               <Space>
                  {opt.icon}
                  {opt.label}
               </Space>
            </Option>
         ))}
      </Select>
   );

   const authorFilterOptions: FilterOption<AuthorFilterType>[] = [
      { value: "all", label: "Все авторы", icon: <UserOutlined /> },
      { value: "popular", label: "Популярные", icon: <FireOutlined /> },
      { value: "new", label: "Новые", icon: <ClockCircleOutlined /> },
      { value: "featured", label: "Рекомендуемые", icon: <StarOutlined /> },
   ];

   const bookFilterOptions: FilterOption<BookFilterType>[] = [
      { value: "all", label: "Все книги", icon: <BookOutlined /> },
      { value: "popular", label: "Популярные", icon: <FireOutlined /> },
      { value: "new", label: "Новые", icon: <ClockCircleOutlined /> },
      { value: "topRated", label: "Высокий рейтинг", icon: <StarOutlined /> },
   ];

   const mediaFilterOptions: FilterOption<MediaFilterType>[] = [
      { value: "all", label: "Все медиа", icon: <PlayCircleOutlined /> },
      { value: "popular", label: "Популярные", icon: <FireOutlined /> },
      { value: "new", label: "Новые", icon: <ClockCircleOutlined /> },
      { value: "trending", label: "В тренде", icon: <StarOutlined /> },
   ];

   const postFilterOptions: FilterOption<PostFilterType>[] = [
      { value: "all", label: "Все посты", icon: <FileTextOutlined /> },
      { value: "popular", label: "Популярные", icon: <FireOutlined /> },
      { value: "new", label: "Новые", icon: <ClockCircleOutlined /> },
      { value: "mostLiked", label: "Самые любимые", icon: <StarOutlined /> },
   ];

   const tabIcons = {
      authors: <UserOutlined style={{ fontSize: "18px" }} />,
      books: <BookOutlined style={{ fontSize: "18px" }} />,
      media: <PlayCircleOutlined style={{ fontSize: "18px" }} />,
      posts: <FileTextOutlined style={{ fontSize: "18px" }} />,
   };

   const items = [
      {
         key: "authors",
         label: (
            <Space>
               {tabIcons.authors}
               <span>Авторы</span>
            </Space>
         ),
         children: (
            <div>
               <Space style={{ marginBottom: 16 }}>
                  <FilterSelect<AuthorFilterType>
                     value={authorFilter}
                     onChange={setAuthorFilter}
                     options={authorFilterOptions}
                  />
               </Space>
               <AuthorsList searchQuery={searchQuery} filter={authorFilter} />
            </div>
         ),
      },
      {
         key: "books",
         label: (
            <Space>
               {tabIcons.books}
               <span>Книги</span>
            </Space>
         ),
         children: (
            <div>
               <Space style={{ marginBottom: 16 }}>
                  <FilterSelect<BookFilterType>
                     value={bookFilter}
                     onChange={setBookFilter}
                     options={bookFilterOptions}
                  />
               </Space>
               <BooksList searchQuery={searchQuery} filter={bookFilter} />
            </div>
         ),
      },
      {
         key: "media",
         label: (
            <Space>
               {tabIcons.media}
               <span>Медиа</span>
            </Space>
         ),
         children: (
            <div>
               <Space style={{ marginBottom: 16 }}>
                  <FilterSelect<MediaFilterType>
                     value={mediaFilter}
                     onChange={setMediaFilter}
                     options={mediaFilterOptions}
                  />
               </Space>
               <MediaList searchQuery={searchQuery} filter={mediaFilter} />
            </div>
         ),
      },
      {
         key: "posts",
         label: (
            <Space>
               {tabIcons.posts}
               <span>Посты</span>
            </Space>
         ),
         children: (
            <div>
               <Space style={{ marginBottom: 16 }}>
                  <FilterSelect<PostFilterType>
                     value={postFilter}
                     onChange={setPostFilter}
                     options={postFilterOptions}
                  />
               </Space>
               <PostsList searchQuery={searchQuery} filter={postFilter} />
            </div>
         ),
      },
   ];

   return (
      <motion.div
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ duration: 0.5 }}
         style={{ padding: "24px" }}
      >
         <Row gutter={[24, 24]}>
            <Col span={24}>
               <Card
                  style={{
                     borderRadius: "16px",
                     boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
                  }}
               >
                  <Space
                     direction="vertical"
                     size="large"
                     style={{ width: "100%" }}
                  >
                     <Space
                        direction="vertical"
                        style={{ width: "100%" }}
                        size="middle"
                     >
                        <Title level={2} style={{ margin: 0 }}>
                           Исследуйте контент
                        </Title>
                        <Input
                           prefix={
                              <SearchOutlined style={{ color: "#1890ff" }} />
                           }
                           placeholder="Поиск по названию..."
                           onChange={(e) => handleSearch(e.target.value)}
                           size="large"
                           style={{
                              borderRadius: "8px",
                              maxWidth: "500px",
                           }}
                           allowClear
                        />
                     </Space>

                     <Tabs
                        defaultActiveKey="authors"
                        items={items}
                        style={{
                           minHeight: "60vh",
                        }}
                        tabBarStyle={{
                           marginBottom: "24px",
                           borderBottom: "2px solid #f0f0f0",
                        }}
                        animated={{ tabPane: true }}
                     />
                  </Space>
               </Card>
            </Col>
         </Row>

         <style>
            {`
               .ant-tabs-tab {
                  transition: all 0.3s ease;
                  padding: 12px 24px !important;
                  border-radius: 8px !important;
                  margin: 0 8px 0 0 !important;
               }

               .ant-tabs-tab:hover {
                  transform: translateY(-2px);
                  color: #1890ff !important;
               }

               .ant-tabs-tab.ant-tabs-tab-active {
                  background: #e6f7ff;
                  border-radius: 8px !important;
               }

               .ant-tabs-ink-bar {
                  display: none;
               }

               .ant-input-affix-wrapper {
                  transition: all 0.3s ease;
               }

               .ant-input-affix-wrapper:hover,
               .ant-input-affix-wrapper:focus {
                  transform: translateY(-2px);
                  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
               }

               .ant-card {
                  transition: all 0.3s ease;
               }

               .ant-card:hover {
                  transform: translateY(-2px);
                  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
               }

               .ant-select {
                  transition: all 0.3s ease;
               }

               .ant-select:hover {
                  transform: translateY(-2px);
               }

               .ant-select-focused:not(.ant-select-disabled).ant-select:not(.ant-select-customize-input) .ant-select-selector {
                  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
               }
            `}
         </style>
      </motion.div>
   );
};
