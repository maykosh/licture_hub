import React from "react";
import { PostCard } from "./PostCard";
import { IPosts } from "../../model/type";
import { Empty } from "antd";
import { useAuthStore } from "@/entities/auth/model/store";

interface IProps {
   posts: IPosts[];
   handleEdit: (id: string) => void;
   handleDelete: (id: string) => void;
   likeCounts: Record<string, number>;
}

export const PostList: React.FC<IProps> = ({
   posts,
   handleEdit,
   handleDelete,
   likeCounts,
}) => {
   const userId = useAuthStore((state) => state.user?.uid);
   
   if (posts.length === 0)
      return <Empty description="Нет опубликованных постов" />;
   return (
      <div className="grid grid-cols-3 gap-4">
         {posts?.map((post) => (
            <PostCard
               key={post.id}
               posts={post}
               onEdit={handleEdit}
               onDelete={handleDelete}
               likeCount={likeCounts[post.id] || 0}
               userId={userId as string}
            />
         ))}
      </div>
   );
};
