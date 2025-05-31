import React, { useEffect, useState } from "react";
import {
   List,
   Card,
   Typography,
   Image,
   Space,
   Modal,
   Button,
   Tag,
   message,
} from "antd";
import {
   BookOutlined,
   DownloadOutlined,
   ReadOutlined,
   ShoppingOutlined,
} from "@ant-design/icons";
import { supabase } from "@/shared/supabase/supabaseClient";
import { LikeButton } from "@/shared/ui/LikeButton";
import { useAuthStore } from "@/entities/auth";
import { motion } from "framer-motion";

const { Title, Text, Paragraph } = Typography;

interface Book {
   id: string;
   title: string;
   description: string;
   cover_url: string;
   file_url: string;
   price: number;
   is_paid: boolean;
   author_name: string;
   author_id: string;
   likes_count: number;
   created_at: string;
}

interface BooksListProps {
   searchQuery: string;
   authorId?: string;
   filter?: "all" | "popular" | "new" | "topRated";
}

export const BooksList: React.FC<BooksListProps> = ({
   searchQuery,
   authorId,
   filter = "all",
}) => {
   const [books, setBooks] = useState<Book[]>([]);
   const [loading, setLoading] = useState(true);
   const [selectedBook, setSelectedBook] = useState<Book | null>(null);
   const userId = useAuthStore((state) => state.user?.uid);

   useEffect(() => {
      const fetchBooks = async () => {
         try {
            setLoading(true);
            let query = supabase.from("books").select(`
                  *,
                  authors:author_id (
                    author_name
                  ),
                  likes:likes!likes_book_id_fkey (
                    count
                  )
               `);

            if (searchQuery) {
               query = query.or(
                  `title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`
               );
            }

            if (authorId) {
               query = query.eq("author_id", authorId);
            }

            const { data, error } = await query;

            if (error) throw error;

            let processedBooks =
               data?.map((book) => ({
                  ...book,
                  author_name: book.authors?.author_name,
                  likes_count: book.likes[0]?.count || 0,
               })) || [];

            // Применяем фильтрацию
            switch (filter) {
               case "popular":
                  processedBooks.sort((a, b) => b.likes_count - a.likes_count);
                  processedBooks = processedBooks.slice(0, 10); // Топ 10 популярных
                  break;
               case "new":
                  processedBooks.sort(
                     (a, b) =>
                        new Date(b.created_at).getTime() -
                        new Date(a.created_at).getTime()
                  );
                  break;
               case "topRated":
                  // Здесь можно добавить логику для фильтрации по рейтингу
                  // Например, если у вас есть поле rating в базе данных
                  console.log(processedBooks);
                  processedBooks = processedBooks.filter(
                     (book) => book.likes_count >= 10
                  );
                  break;
               default:
                  // Для 'all' не применяем дополнительную фильтрацию
                  break;
            }

            setBooks(processedBooks);
         } catch (error) {
            console.error("Ошибка при загрузке книг:", error);
         } finally {
            setLoading(false);
         }
      };

      fetchBooks();
   }, [searchQuery, authorId, filter]);

   const handleDownload = async (book: Book) => {
      if (book.is_paid && !book.file_url) {
         message.warning("Для скачивания необходимо приобрести книгу");
         return;
      }

      try {
         if (!book.file_url) {
            message.error("Файл книги недоступен");
            return;
         }

         window.open(book.file_url, "_blank");
         message.success("Скачивание началось");
      } catch (error) {
         console.error("Ошибка при скачивании:", error);
         message.error("Ошибка при скачивании книги");
      }
   };

   const handleReadBook = (book: Book) => {
      if (book.is_paid) {
         message.warning("Для чтения необходимо приобрести книгу");
         return;
      }
      setSelectedBook(book);
   };

   return (
      <>
         <List
            grid={{
               gutter: 16,
               xs: 1,
               sm: 2,
               md: 2,
               lg: 3,
            }}
            dataSource={books}
            loading={loading}
            renderItem={(book) => (
               <List.Item>
                  <motion.div
                     whileHover={{ y: -5 }}
                     transition={{ duration: 0.2 }}
                  >
                     <Card
                        hoverable
                        style={{
                           height: "100%",
                           display: "flex",
                           flexDirection: "column",
                           overflow: "hidden",
                           borderRadius: "12px",
                           boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        }}
                        bodyStyle={{
                           flex: 1,
                           display: "flex",
                           flexDirection: "column",
                           padding: 0,
                        }}
                     >
                        <div
                           style={{
                              width: "100%",
                              height: "280px",
                              position: "relative",
                              overflow: "hidden",
                              borderRadius: "8px 8px 0 0",
                              background: "#f5f5f5",
                           }}
                        >
                           {book.cover_url ? (
                              <img
                                 alt={book.title}
                                 src={book.cover_url}
                                 style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                 }}
                              />
                           ) : (
                              <div
                                 style={{
                                    width: "100%",
                                    height: "100%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                 }}
                              >
                                 <BookOutlined
                                    style={{
                                       fontSize: 48,
                                       color: "#bfbfbf",
                                    }}
                                 />
                              </div>
                           )}
                           {book.is_paid && (
                              <Tag
                                 color="gold"
                                 style={{
                                    position: "absolute",
                                    top: 8,
                                    right: 8,
                                    fontSize: "14px",
                                 }}
                              >
                                 {book.price} ₽
                              </Tag>
                           )}
                        </div>
                        <div style={{ flex: 1, padding: "16px" }}>
                           <Title
                              level={4}
                              ellipsis={{ rows: 2 }}
                              style={{
                                 marginBottom: 8,
                                 minHeight: "48px",
                                 fontSize: "18px",
                              }}
                           >
                              {book.title}
                           </Title>
                           <Paragraph
                              ellipsis={{ rows: 3 }}
                              style={{
                                 marginBottom: 16,
                                 minHeight: "66px",
                                 color: "#666",
                              }}
                           >
                              {book.description}
                           </Paragraph>
                           <div
                              style={{
                                 display: "flex",
                                 justifyContent: "space-between",
                                 alignItems: "center",
                                 marginBottom: 16,
                              }}
                           >
                              <Text type="secondary">
                                 Автор: {book.author_name}
                              </Text>
                              <Space>
                                 <Text type="secondary">
                                    {new Date(
                                       book.created_at
                                    ).toLocaleDateString("ru-RU")}
                                 </Text>
                                 <LikeButton
                                    contentId={book.id}
                                    contentType="book"
                                    initialLikesCount={book.likes_count}
                                    userId={userId}
                                    size="small"
                                    onLikeChange={(newCount) => {
                                       setBooks((prevBooks) =>
                                          prevBooks.map((b) =>
                                             b.id === book.id
                                                ? {
                                                     ...b,
                                                     likes_count: newCount,
                                                  }
                                                : b
                                          )
                                       );
                                    }}
                                 />
                              </Space>
                           </div>
                           <Space.Compact block>
                              <Button
                                 type="primary"
                                 icon={<ReadOutlined />}
                                 onClick={() => handleReadBook(book)}
                                 style={{ width: "50%" }}
                              >
                                 Читать
                              </Button>
                              {book.is_paid ? (
                                 <Button
                                    type="default"
                                    icon={<ShoppingOutlined />}
                                    onClick={() =>
                                       message.info(
                                          "Функция покупки в разработке"
                                       )
                                    }
                                    style={{ width: "50%" }}
                                 >
                                    Купить
                                 </Button>
                              ) : (
                                 <Button
                                    type="default"
                                    icon={<DownloadOutlined />}
                                    onClick={() => handleDownload(book)}
                                    style={{ width: "50%" }}
                                 >
                                    Скачать
                                 </Button>
                              )}
                           </Space.Compact>
                        </div>
                     </Card>
                  </motion.div>
               </List.Item>
            )}
         />

         <Modal
            title={
               <div
                  style={{
                     borderBottom: "1px solid #f0f0f0",
                     paddingBottom: 16,
                  }}
               >
                  <Title level={3} style={{ margin: 0 }}>
                     {selectedBook?.title}
                  </Title>
                  <Space style={{ marginTop: 8 }}>
                     <Text type="secondary">
                        Автор: {selectedBook?.author_name}
                     </Text>
                     <Text type="secondary">
                        {selectedBook &&
                           new Date(selectedBook.created_at).toLocaleDateString(
                              "ru-RU"
                           )}
                     </Text>
                  </Space>
               </div>
            }
            open={!!selectedBook}
            onCancel={() => setSelectedBook(null)}
            footer={null}
            width={800}
            style={{ top: 20 }}
         >
            {selectedBook && (
               <div style={{ padding: "20px 0" }}>
                  <Space
                     direction="vertical"
                     size="large"
                     style={{ width: "100%" }}
                  >
                     <div style={{ display: "flex", gap: "24px" }}>
                        <div style={{ flex: "0 0 300px" }}>
                           {selectedBook.cover_url ? (
                              <Image
                                 alt={selectedBook.title}
                                 src={selectedBook.cover_url}
                                 style={{
                                    width: "100%",
                                    borderRadius: "8px",
                                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                 }}
                              />
                           ) : (
                              <div
                                 style={{
                                    width: "100%",
                                    aspectRatio: "2/3",
                                    background: "#f5f5f5",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    borderRadius: "8px",
                                 }}
                              >
                                 <BookOutlined
                                    style={{ fontSize: 64, color: "#bfbfbf" }}
                                 />
                              </div>
                           )}
                        </div>
                        <div style={{ flex: 1 }}>
                           <Paragraph
                              style={{ fontSize: "16px", lineHeight: "1.8" }}
                           >
                              {selectedBook.description}
                           </Paragraph>
                           <Space
                              direction="vertical"
                              size="large"
                              style={{ width: "100%" }}
                           >
                              {selectedBook.is_paid ? (
                                 <Button
                                    type="primary"
                                    icon={<ShoppingOutlined />}
                                    size="large"
                                    block
                                    onClick={() =>
                                       message.info(
                                          "Функция покупки в разработке"
                                       )
                                    }
                                 >
                                    Купить за {selectedBook.price} ₽
                                 </Button>
                              ) : (
                                 <Space.Compact block>
                                    <Button
                                       type="primary"
                                       icon={<ReadOutlined />}
                                       size="large"
                                       style={{ width: "50%" }}
                                       onClick={() =>
                                          window.open(
                                             selectedBook.file_url,
                                             "_blank"
                                          )
                                       }
                                    >
                                       Читать онлайн
                                    </Button>
                                    <Button
                                       icon={<DownloadOutlined />}
                                       size="large"
                                       style={{ width: "50%" }}
                                       onClick={() =>
                                          handleDownload(selectedBook)
                                       }
                                    >
                                       Скачать
                                    </Button>
                                 </Space.Compact>
                              )}
                           </Space>
                        </div>
                     </div>
                     <div
                        style={{
                           display: "flex",
                           justifyContent: "space-between",
                           alignItems: "center",
                           marginTop: 24,
                           padding: "16px 0",
                           borderTop: "1px solid #f0f0f0",
                        }}
                     >
                        <Text type="secondary">
                           Опубликовано:{" "}
                           {new Date(
                              selectedBook.created_at
                           ).toLocaleDateString("ru-RU")}
                        </Text>
                        <LikeButton
                           contentId={selectedBook.id}
                           contentType="book"
                           initialLikesCount={selectedBook.likes_count}
                           userId={userId}
                           onLikeChange={(newCount) => {
                              setSelectedBook((prev) =>
                                 prev
                                    ? { ...prev, likes_count: newCount }
                                    : null
                              );
                              setBooks((prevBooks) =>
                                 prevBooks.map((b) =>
                                    b.id === selectedBook.id
                                       ? { ...b, likes_count: newCount }
                                       : b
                                 )
                              );
                           }}
                        />
                     </div>
                  </Space>
               </div>
            )}
         </Modal>
      </>
   );
};
