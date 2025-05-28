import React, { useEffect, useState } from "react";
import {
   Table,
   Space,
   Button,
   Typography,
   message,
   Popconfirm,
   Avatar,
   Card,
   Input,
   Tag,
   Tooltip,
} from "antd";
import {
   UserOutlined,
   DeleteOutlined,
   SearchOutlined,
   SyncOutlined,
} from "@ant-design/icons";
import { useAuthStore } from "@/entities/auth";
import { followService } from "@/entities/author/api/followService";
import { supabase } from "@/shared/supabase/supabaseClient";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

interface UserData {
   email: string;
   full_name: string;
   role_id: string;
   avatar_url?: string;
}

interface FollowerData {
   id: string;
   user_id: string;
   created_at: string;
   user: UserData;
}

interface Follower extends Omit<FollowerData, "user"> {
   user: UserData & {
      role: string;
   };
}

export const FollowersManagement = () => {
   const [followers, setFollowers] = useState<Follower[]>([]);
   const [loading, setLoading] = useState(true);
   const [refreshing, setRefreshing] = useState(false);
   const [searchText, setSearchText] = useState("");
   const { user } = useAuthStore();
   const navigate = useNavigate();

   useEffect(() => {
      if (!user) {
         navigate("/login");
         return;
      }
      fetchFollowers();
   }, [user]);

   const fetchFollowers = async () => {
      try {
         setLoading(true);
         const { data: followersData, error: followersError } = await supabase
            .from("followers")
            .select(
               `
               id,
               user_id,
               created_at,
               user:users!followers_user_id_fkey (
                  email,
                  full_name,
                  role_id,
                  avatar_url
               )
            `
            )
            .eq("author_id", user?.uid);

         if (followersError) throw followersError;

         console.log("Полученные данные о подписчиках:", followersData);

         // Получаем информацию о ролях
         const { data: rolesData } = await supabase
            .from("roles")
            .select("id, name");

         const rolesMap = new Map(
            rolesData?.map((role) => [role.id, role.name]) || []
         );

         const formattedFollowers =
            (followersData as unknown as FollowerData[])
               ?.filter(
                  (follower): follower is FollowerData => follower.user !== null
               )
               .map((follower) => ({
                  ...follower,
                  user: {
                     ...follower.user,
                     role: rolesMap.get(follower.user.role_id) || "user",
                  },
               })) || [];

         console.log(
            "Отформатированные данные о подписчиках:",
            formattedFollowers
         );
         setFollowers(formattedFollowers);
      } catch (error) {
         console.error("Ошибка при загрузке подписчиков:", error);
         message.error("Не удалось загрузить список подписчиков");
      } finally {
         setLoading(false);
      }
   };
   const handleRemoveFollower = async (followerId: string, userId: string) => {
      try {
         const success = await followService.unfollow(userId, user!.uid);
         if (success) {
            setFollowers((prev) => prev.filter((f) => f.id !== followerId));
            message.success("Подписчик успешно удален");
         }
      } catch (error) {
         console.error("Ошибка при удалении подписчика:", error);
         message.error("Не удалось удалить подписчика");
      }
   };

   const handleUserClick = (userId: string, isAuthor: boolean) => {
      if (isAuthor) {
         navigate(`/author/${userId}`);
      }
   };

   const handleRefresh = async () => {
      setRefreshing(true);
      await fetchFollowers();
      setRefreshing(false);
   };

   const filteredFollowers = followers.filter(
      (follower) =>
         follower.user.full_name
            .toLowerCase()
            .includes(searchText.toLowerCase()) ||
         follower.user.email.toLowerCase().includes(searchText.toLowerCase())
   );

   const columns = [
      {
         title: "Подписчик",
         key: "user",
         render: (record: Follower) => (
            <Space>
               <Avatar
                  size="large"
                  icon={<UserOutlined />}
                  src={record.user.avatar_url}
               />
               <Space direction="vertical" size={0}>
                  <Text
                     strong
                     style={{
                        cursor:
                           record.user.role === "author"
                              ? "pointer"
                              : "default",
                     }}
                     onClick={() =>
                        handleUserClick(
                           record.user_id,
                           record.user.role === "author"
                        )
                     }
                  >
                     {record.user.full_name}
                  </Text>
                  <Text type="secondary" style={{ fontSize: "12px" }}>
                     {record.user.email}
                  </Text>
               </Space>
            </Space>
         ),
      },
      {
         title: "Роль",
         key: "role",
         render: (record: Follower) => (
            <Tag color={record.user.role === "author" ? "blue" : "default"}>
               {record.user.role === "author" ? "Автор" : "Пользователь"}
            </Tag>
         ),
      },
      {
         title: "Дата подписки",
         key: "created_at",
         render: (record: Follower) => (
            <Text>
               {new Date(record.created_at).toLocaleDateString("ru-RU", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
               })}
            </Text>
         ),
      },
      {
         title: "Действия",
         key: "actions",
         render: (record: Follower) => (
            <Space>
               <Popconfirm
                  title="Удалить подписчика?"
                  description="Вы уверены, что хотите удалить этого подписчика?"
                  onConfirm={() =>
                     handleRemoveFollower(record.id, record.user_id)
                  }
                  okText="Да"
                  cancelText="Нет"
               >
                  <Button type="text" danger icon={<DeleteOutlined />}>
                     Удалить
                  </Button>
               </Popconfirm>
            </Space>
         ),
      },
   ];

   return (
      <Card>
         <Space direction="vertical" style={{ width: "100%" }} size="large">
            <Space
               direction="horizontal"
               style={{
                  width: "100%",
                  justifyContent: "space-between",
                  marginBottom: "24px",
               }}
            >
               <Space>
                  <Title level={2} style={{ margin: 0 }}>
                     Управление подписчиками
                  </Title>
                  <Tooltip title="Обновить список">
                     <Button
                        icon={<SyncOutlined spin={refreshing} />}
                        onClick={handleRefresh}
                        loading={refreshing}
                     />
                  </Tooltip>
               </Space>
               <Input
                  placeholder="Поиск по имени или email"
                  prefix={<SearchOutlined />}
                  style={{ width: 300 }}
                  onChange={(e) => setSearchText(e.target.value)}
                  allowClear
               />
            </Space>

            <div style={{ marginBottom: 16 }}>
               <Space size={4}>
                  <Text>Последние подписчики:</Text>
                  <Avatar.Group
                     max={{
                        count: 5,
                        style: { color: "#fff", backgroundColor: "#1890ff" },
                     }}
                  >
                     {followers.slice(0, 5).map((follower) => (
                        <Tooltip
                           key={follower.id}
                           title={follower.user.full_name}
                        >
                           <Avatar
                              src={follower.user.avatar_url}
                              icon={
                                 !follower.user.avatar_url && <UserOutlined />
                              }
                           />
                        </Tooltip>
                     ))}
                  </Avatar.Group>
               </Space>
            </div>

            <Table
               columns={columns}
               dataSource={filteredFollowers}
               loading={loading}
               rowKey="id"
               pagination={{
                  pageSize: 10,
                  showSizeChanger: false,
                  showTotal: (total) => `Всего подписчиков: ${total}`,
               }}
            />
         </Space>
      </Card>
   );
};
