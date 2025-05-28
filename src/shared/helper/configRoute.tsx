import { BiSearch } from "react-icons/bi"; 
import { MdOutlinePermMedia } from "react-icons/md";
import { BiMessageSquareAdd } from "react-icons/bi";
import { CgProfile } from "react-icons/cg";
import { TeamOutlined } from "@ant-design/icons";

export const AuthorRoutes = [
   {
      // path: "/author-profile",
      id: 1,
      label: "Профиль",
      icon: <CgProfile />,
   },
   {
      id: 2,
      path: "/create-post",
      label: "Создать пост",
      icon: <BiMessageSquareAdd />,
   },
   {
      id: 3,
      path: "/create-other",
      label: "Добавить медия",
      icon: <MdOutlinePermMedia />,
   },
   {
      id: 4,
      path: "/other-authors",
      label: "Другие контенты",
      icon: <BiSearch />,
   },
   {
      id: 5,
      path: "/followers-management",
      label: "Подписчики",
      icon: <TeamOutlined />,
   },
];
