import React, { useEffect, useState } from "react";
import { Row, Col, Empty, Spin } from "antd";
import { supabase } from "@/shared";
import { BookCard } from "./BookCard";
import { useAuthStore } from "@/entities/auth";
import { useAuthorProfileStore } from "../../model/store";

interface Book {
   id: number;
   author_id: string;
   title: string;
   description: string;
   cover_url: string;
   price: string;
   is_paid: boolean;
   file_url: string;
   likesCount: number;
}

export const BooksList: React.FC = () => {
   const [books, setBooks] = useState<Book[]>([]);
   const [loading, setLoading] = useState(true);
   const userId = useAuthStore((state) => state.user?.uid);
   const { author, setAuthorProfile } = useAuthorProfileStore();

   const fetchBooks = async () => {
      if (!userId) {
         setLoading(false);
         return;
      }

      try {
         const { data: booksData, error: booksError } = await supabase
            .from("books")
            .select("*")
            .eq("author_id", userId)
            .not("file_url", "ilike", "%youtube%")
            .order("created_at", { ascending: false });

         if (booksError) throw booksError;

         // Получаем количество лайков для каждой книги
         const booksWithLikes = await Promise.all(
            (booksData || []).map(async (book) => {
               const { count } = await supabase
                  .from("likes")
                  .select("*", { count: "exact" })
                  .eq("book_id", book.id);

               return {
                  ...book,
                  likesCount: count || 0,
               };
            })
         );

         setBooks(booksWithLikes);
      } catch (error) {
         console.error("Ошибка при загрузке книг:", error);
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      fetchBooks();
   }, [userId]);

   const handleEdit = (id: number) => {
      "Edit book:", id;
   };

   const handleDelete = (id: number) => {
      setBooks((prevBooks) => {
         const newBooks = prevBooks.filter((book) => book.id !== id);
         if (author) {
            setAuthorProfile({
               ...author,
               booksCount: author.booksCount - 1,
            });
         }
         return newBooks;
      });
      fetchBooks();
   };

   if (!userId) {
      return <Empty description="Необходимо авторизоваться" />;
   }

   if (loading) {
      return (
         <div style={{ textAlign: "center", padding: "40px 0" }}>
            <Spin size="large" />
         </div>
      );
   }

   if (books.length === 0) {
      return <Empty description="У вас пока нет книг" />;
   }

   return (
      <div style={{ padding: "24px 0" }}>
         <Row gutter={[24, 24]} style={{ margin: 0 }}>
            {books.map((book) => (
               <Col
                  xs={24}
                  sm={12}
                  md={8}
                  lg={6}
                  key={book.id}
                  style={{ display: "flex" }}
               >
                  <div style={{ width: "100%", height: "100%" }}>
                     <BookCard
                        {...book}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        userId={userId || ""}
                     />
                  </div>
               </Col>
            ))}
         </Row>
      </div>
   );
};
