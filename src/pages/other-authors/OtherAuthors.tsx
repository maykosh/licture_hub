import React, { useState } from "react";
import { Tabs, Card, Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { AuthorsList } from "@/widgets/authors-list";
import { BooksList } from "@/widgets/books-list";
import { MediaList } from "@/widgets/media-list";
import { PostsList } from "@/widgets/posts-list";

export const OtherAuthors: React.FC = () => {
   const [searchQuery, setSearchQuery] = useState("");

   const handleSearch = (value: string) => {
      setSearchQuery(value);
   };

   const items = [
      {
         key: "authors",
         label: "Авторы",
         children: <AuthorsList searchQuery={searchQuery} />,
      },
      {
         key: "books",
         label: "Книги",
         children: <BooksList searchQuery={searchQuery} />,
      },
      {
         key: "media",
         label: "Медиа",
         children: <MediaList searchQuery={searchQuery} />,
      },
      {
         key: "posts",
         label: "Посты",
         children: <PostsList searchQuery={searchQuery} />,
      },
   ];

   return (
      <div style={{ padding: "24px" }}>
         <Card>
            <Input
               prefix={<SearchOutlined />}
               placeholder="Поиск..."
               onChange={(e) => handleSearch(e.target.value)}
               style={{ marginBottom: "24px" }}
            />

            <Tabs
               defaultActiveKey="authors"
               items={items}
               style={{ minHeight: "60vh" }}
            />
         </Card>
      </div>
   );
};
