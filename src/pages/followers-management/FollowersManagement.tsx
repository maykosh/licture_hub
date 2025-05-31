import { useEffect, useState } from "react";
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
   Select,
   Statistic,
   Row,
   Col,
} from "antd";
import {
   UserOutlined,
   DeleteOutlined,
   SearchOutlined,
   SyncOutlined,
   TeamOutlined,
   CalendarOutlined,
   UserSwitchOutlined,
} from "@ant-design/icons";
import { useAuthStore } from "@/entities/auth";
import { followService } from "@/entities/author/api/followService";
import { supabase } from "@/shared/supabase/supabaseClient";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const { Title, Text } = Typography;
const { Option } = Select;

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
   const [sortField, setSortField] = useState<string>("created_at");
   const [sortOrder, setSortOrder] = useState<"ascend" | "descend">("descend");
   const [roleFilter, setRoleFilter] = useState<string>("all");
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

   const handleSortChange = (value: string) => {
      setSortField(value);
   };

   const handleOrderChange = (value: "ascend" | "descend") => {
      setSortOrder(value);
   };

   const sortedAndFilteredFollowers = filteredFollowers
      .filter((follower) =>
         roleFilter === "all" ? true : follower.user.role === roleFilter
      )
      .sort((a, b) => {
         if (sortField === "created_at") {
            return sortOrder === "ascend"
               ? new Date(a.created_at).getTime() -
                    new Date(b.created_at).getTime()
               : new Date(b.created_at).getTime() -
                    new Date(a.created_at).getTime();
         }
         if (sortField === "name") {
            return sortOrder === "ascend"
               ? a.user.full_name.localeCompare(b.user.full_name)
               : b.user.full_name.localeCompare(a.user.full_name);
         }
         if (sortField === "role") {
            return sortOrder === "ascend"
               ? a.user.role.localeCompare(b.user.role)
               : b.user.role.localeCompare(a.user.role);
         }
         return 0;
      });

   const getStatistics = () => {
      const total = followers.length;
      const authors = followers.filter((f) => f.user.role === "author").length;
      const readers = followers.filter((f) => f.user.role !== "author").length;
      const recent = followers.filter(
         (f) =>
            new Date(f.created_at).getTime() >
            Date.now() - 7 * 24 * 60 * 60 * 1000
      ).length;

      return { total, authors, readers, recent };
   };

   const stats = getStatistics();

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
                  {/* <Text type="secondary" style={{ fontSize: "12px" }}>
                     {record.user.email}
                  </Text> */}
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
      <motion.div
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ duration: 0.5 }}
      >
         <Card
            style={{
               // background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
               borderRadius: "16px",
               boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
            }}
         >
            <Space direction="vertical" style={{ width: "100%" }} size="large">
               <Row gutter={[24, 24]}>
                  <Col span={24}>
                     <Card
                        style={{
                           background: "rgba(255, 255, 255, 0.9)",
                           backdropFilter: "blur(10px)",
                           borderRadius: "12px",
                        }}
                     >
                        <Space
                           direction="horizontal"
                           style={{
                              width: "100%",
                              justifyContent: "space-between",
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
                                    type="primary"
                                    ghost
                                 />
                              </Tooltip>
                           </Space>
                           <Space>
                              <Select
                                 defaultValue="created_at"
                                 style={{ width: 150 }}
                                 onChange={handleSortChange}
                              >
                                 <Option value="created_at">По дате</Option>
                                 <Option value="name">По имени</Option>
                                 <Option value="role">По роли</Option>
                              </Select>
                              <Select
                                 defaultValue="descend"
                                 style={{ width: 150 }}
                                 onChange={handleOrderChange}
                              >
                                 <Option value="ascend">По возрастанию</Option>
                                 <Option value="descend">По убыванию</Option>
                              </Select>
                              <Select
                                 defaultValue="all"
                                 style={{ width: 150 }}
                                 onChange={(value) => setRoleFilter(value)}
                              >
                                 <Option value="all">Все роли</Option>
                                 <Option value="author">Только авторы</Option>
                                 <Option value="reader">Только читатели</Option>
                              </Select>
                              <Input
                                 placeholder="Поиск по имени или email"
                                 prefix={<SearchOutlined />}
                                 style={{ width: 300 }}
                                 onChange={(e) => setSearchText(e.target.value)}
                                 allowClear
                              />
                           </Space>
                        </Space>
                     </Card>
                  </Col>

                  <Col span={24}>
                     <Row gutter={[16, 16]}>
                        <Col xs={24} sm={12} md={6}>
                           <Card style={{ borderRadius: "12px" }}>
                              <Statistic
                                 title="Всего подписчиков"
                                 value={stats.total}
                                 prefix={<TeamOutlined />}
                              />
                           </Card>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                           <Card style={{ borderRadius: "12px" }}>
                              <Statistic
                                 title="Авторы"
                                 value={stats.authors}
                                 prefix={<UserSwitchOutlined />}
                                 valueStyle={{ color: "#1890ff" }}
                              />
                           </Card>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                           <Card style={{ borderRadius: "12px" }}>
                              <Statistic
                                 title="Читатели"
                                 value={stats.readers}
                                 prefix={<UserOutlined />}
                                 valueStyle={{ color: "#52c41a" }}
                              />
                           </Card>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                           <Card style={{ borderRadius: "12px" }}>
                              <Statistic
                                 title="Новые за неделю"
                                 value={stats.recent}
                                 prefix={<CalendarOutlined />}
                                 valueStyle={{ color: "#722ed1" }}
                              />
                           </Card>
                        </Col>
                     </Row>
                  </Col>

                  <Col span={24}>
                     <Card
                        style={{
                           background: "rgba(255, 255, 255, 0.9)",
                           backdropFilter: "blur(10px)",
                           borderRadius: "12px",
                        }}
                     >
                        <Table
                           columns={columns}
                           dataSource={sortedAndFilteredFollowers}
                           loading={loading}
                           rowKey="id"
                           pagination={{
                              pageSize: 10,
                              showSizeChanger: true,
                              showTotal: (total) =>
                                 `Всего подписчиков: ${total}`,
                              pageSizeOptions: ["10", "20", "50"],
                           }}
                           style={{ marginTop: 16 }}
                        />
                     </Card>
                  </Col>
               </Row>
            </Space>
         </Card>

         <style>
            {`
               .ant-table-thead > tr > th {
                  background: rgba(0, 0, 0, 0.02);
               }
               
               .ant-card {
                  transition: all 0.3s ease;
               }
               
               .ant-card:hover {
                  transform: translateY(-2px);
                  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
               }
               
               .ant-btn {
                  transition: all 0.3s ease;
               }
               
               .ant-btn:hover {
                  transform: translateY(-2px);
               }
               
               .ant-select {
                  transition: all 0.3s ease;
               }
               
               .ant-select:hover {
                  transform: translateY(-2px);
               }
            `}
         </style>
      </motion.div>
   );
};
