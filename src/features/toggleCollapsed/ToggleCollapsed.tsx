import { Button } from "antd";
import React from "react";
import { useToggleCollapsedStore } from "./model/store";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";

export const ToggleCollapsed: React.FC = () => {
   const { collapsed, setCollapsed } = useToggleCollapsedStore(
      (state) => state
   );
   const toggleCollapsed = () => {
      setCollapsed(!collapsed);
   };
   return (
      <Button type="primary" onClick={toggleCollapsed}>
         {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
      </Button>
   );
};
