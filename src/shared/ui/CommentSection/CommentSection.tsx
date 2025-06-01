import React, { useState, useEffect, useRef } from "react";
import { Comment } from "@ant-design/compatible";
import {
   Avatar,
   Form,
   Button,
   List,
   Input,
   Typography,
   message,
   Space,
   Spin,
   Empty,
   Popconfirm,
} from "antd";
import { UserOutlined, SendOutlined, DeleteOutlined } from "@ant-design/icons";
import { supabase } from "@/shared/supabase/supabaseClient";
import { useAuthStore } from "@/entities/auth";
import { motion } from "framer-motion";
import dayjs from "dayjs";
import "dayjs/locale/ru";
import { v4 as uuidv4 } from "uuid";
import { useNavigate } from "react-router-dom";

dayjs.locale("ru");

const { TextArea } = Input;
const { Text } = Typography;

interface MessageWithUser {
   id: string;
   content: string;
   created_at: string;
   from_user: {
      id: string;
      full_name: string;
      avatar_url: string | null;
   };
   to_author: string;
}

interface CommentData {
   id: string;
   content: string;
   created_at: string;
   from_user: {
      id: string;
      full_name: string;
      avatar_url?: string;
   };
}

interface CommentSectionProps {
   postId: string;
   authorId: string;
}

interface EditorProps {
   value: string;
   onChange: (value: string) => void;
   onSubmit: () => void;
   submitting: boolean;
   user: {
      uid: string;
      email?: string;
   } | null;
}

const Editor = React.memo(
   ({ value, onChange, onSubmit, submitting, user }: EditorProps) => {
      const textAreaRef = useRef<HTMLTextAreaElement>(null);

      const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
         if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSubmit();
         }
      };

      return (
         <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            style={{
               background: "#fff",
               padding: "16px",
               borderRadius: "12px",
               boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
               border: "1px solid rgba(0, 0, 0, 0.06)",
            }}
         >
            <Form.Item style={{ marginBottom: "12px" }}>
               <TextArea
                  ref={textAreaRef}
                  rows={4}
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={
                     user
                        ? "Напишите комментарий..."
                        : "Войдите, чтобы комментировать"
                  }
                  style={{
                     borderRadius: "8px",
                     resize: "none",
                     fontSize: "14px",
                     transition: "all 0.3s ease",
                  }}
                  disabled={!user}
               />
            </Form.Item>
            <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
               <Space>
                  <Text type="secondary" style={{ fontSize: "12px" }}>
                     Нажмите Enter для отправки
                  </Text>
                  <Button
                     type="primary"
                     htmlType="submit"
                     loading={submitting}
                     onClick={onSubmit}
                     icon={<SendOutlined />}
                     disabled={!user || !value.trim()}
                     style={{
                        borderRadius: "8px",
                        transition: "all 0.3s ease",
                     }}
                  >
                     {user ? "Отправить" : "Войдите, чтобы комментировать"}
                  </Button>
               </Space>
            </Form.Item>
         </motion.div>
      );
   }
);

Editor.displayName = "Editor";

const CommentList = React.memo(
   ({
      comments,
      onDelete,
      currentUserId,
      isAuthor,
   }: {
      comments: CommentData[];
      onDelete: (id: string) => void;
      currentUserId?: string;
      isAuthor: boolean;
   }) => {
      const navigate = useNavigate();
      return (
         <List
            dataSource={comments}
            itemLayout="horizontal"
            split={false}
            renderItem={(comment) => (
               <Comment
                  author={
                     <Text
                        onClick={() =>
                           navigate(`/author/${comment.from_user.id}`)
                        }
                        strong
                        style={{ fontSize: "16px", cursor: "pointer" }}
                     >
                        {comment.from_user.full_name}
                     </Text>
                  }
                  avatar={
                     <Avatar
                        src={comment.from_user.avatar_url}
                        icon={<UserOutlined />}
                        size="large"
                     />
                  }
                  content={
                     <div
                        style={{
                           background: "rgba(0, 0, 0, 0.02)",
                           padding: "12px 16px",
                           borderRadius: "12px",
                           marginTop: "8px",
                           border: "1px solid rgba(0, 0, 0, 0.06)",
                        }}
                     >
                        <Text style={{ whiteSpace: "pre-wrap" }}>
                           {comment.content}
                        </Text>
                     </div>
                  }
                  datetime={
                     <Space>
                        <Text type="secondary" style={{ fontSize: "12px" }}>
                           {dayjs(comment.created_at).fromNow()}
                        </Text>
                        {(currentUserId === comment.from_user.id ||
                           isAuthor) && (
                           <Popconfirm
                              title="Удалить комментарий?"
                              description="Это действие нельзя отменить"
                              onConfirm={() => onDelete(comment.id)}
                              okText="Да"
                              cancelText="Нет"
                           >
                              <Button
                                 type="text"
                                 icon={<DeleteOutlined />}
                                 size="small"
                                 danger
                              />
                           </Popconfirm>
                        )}
                     </Space>
                  }
               />
            )}
         />
      );
   }
);

CommentList.displayName = "CommentList";

export const CommentSection: React.FC<CommentSectionProps> = ({
   postId,
   authorId,
}) => {
   const [comments, setComments] = useState<CommentData[]>([]);
   const [submitting, setSubmitting] = useState(false);
   const [value, setValue] = useState("");
   const [loading, setLoading] = useState(true);
   const { user } = useAuthStore();

   const fetchComments = async () => {
      try {
         setLoading(true);
         const { data: messagesData, error: messagesError } = await supabase
            .from("messages")
            .select("*, from_user(*)")
            .eq("to_author", authorId)
            .order("created_at", { ascending: false });

         if (messagesError) throw messagesError;

         const processedComments: CommentData[] = (
            (messagesData as MessageWithUser[]) || []
         ).map((message) => ({
            id: message.id,
            content: message.content,
            created_at: message.created_at,
            from_user: {
               id: message.from_user.id,
               full_name: message.from_user.full_name,
               avatar_url: message.from_user.avatar_url || undefined,
            },
         }));

         setComments(processedComments);
      } catch (error) {
         console.error("Ошибка при загрузке комментариев:", error);
         message.error("Не удалось загрузить комментарии");
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      fetchComments();

      const subscription = supabase
         .channel("messages")
         .on(
            "postgres_changes",
            {
               event: "INSERT",
               schema: "public",
               table: "messages",
               filter: `to_author=eq.${authorId}`,
            },
            () => {
               fetchComments();
            }
         )
         .subscribe();

      return () => {
         subscription.unsubscribe();
      };
   }, [postId, authorId]);

   const handleSubmit = async () => {
      if (!value.trim() || !user) return;

      const commentContent = value.trim();
      let newComment: CommentData = {
         id: uuidv4(),
         content: commentContent,
         created_at: new Date().toISOString(),
         from_user: {
            id: user.uid,
            full_name: "User",
            avatar_url: undefined,
         },
      };

      try {
         setSubmitting(true);

         // Получаем актуальные данные пользователя
         const { data: userData, error: userError } = await supabase
            .from("users")
            .select("full_name, avatar_url")
            .eq("id", user.uid)
            .single();

         if (userError) throw userError;

         newComment = {
            ...newComment,
            from_user: {
               id: user.uid,
               full_name: userData.full_name || "User",
               avatar_url: userData.avatar_url,
            },
         };

         // Оптимистично обновляем UI
         setComments((prev) => [newComment, ...prev]);
         setValue("");

         const { error } = await supabase.from("messages").insert([
            {
               content: newComment.content,
               from_user: user.uid,
               to_author: authorId,
            },
         ]);

         if (error) throw error;
         message.success("Комментарий добавлен");
      } catch (error) {
         console.error("Ошибка при отправке комментария:", error);
         message.error("Не удалось отправить комментарий");
         // Откатываем изменения в случае ошибки
         setComments((prev) =>
            prev.filter((comment) => comment.id !== newComment.id)
         );
         setValue(newComment.content);
      } finally {
         setSubmitting(false);
      }
   };

   const handleDelete = async (commentId: string) => {
      try {
         const { error } = await supabase
            .from("messages")
            .delete()
            .eq("id", commentId);

         if (error) throw error;

         setComments((prev) =>
            prev.filter((comment) => comment.id !== commentId)
         );
         message.success("Комментарий удален");
      } catch (error) {
         console.error("Ошибка при удалении комментария:", error);
         message.error("Не удалось удалить комментарий");
      }
   };

   return (
      <div style={{ marginTop: 24 }}>
         <Space direction="vertical" size="large" style={{ width: "100%" }}>
            {loading ? (
               <div style={{ textAlign: "center", padding: "20px" }}>
                  <Spin size="large" />
               </div>
            ) : (
               <>
                  <Editor
                     value={value}
                     onChange={setValue}
                     onSubmit={handleSubmit}
                     submitting={submitting}
                     user={user}
                  />
                  {comments.length > 0 ? (
                     <CommentList
                        comments={comments}
                        onDelete={handleDelete}
                        currentUserId={user?.uid}
                        isAuthor={user?.uid === authorId}
                     />
                  ) : (
                     <Empty
                        description="Пока нет комментариев"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                     />
                  )}
               </>
            )}
         </Space>
      </div>
   );
};
