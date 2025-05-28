import { Card, Typography, Button, Space, Divider } from "antd";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ProfileOutlined, DownOutlined, UpOutlined } from "@ant-design/icons";

const { Paragraph, Text, Title } = Typography;

type Props = {
   bio?: string;
   name?: string;
   specialization?: string;
};

export const AuthorBio = ({ bio, name, specialization }: Props) => {
   const [showMore, setShowMore] = useState(false);

   const truncatedBio = bio?.slice(0, 200);
   const shouldShowButton = bio && bio.length > 200;

   return (
      <motion.div
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ duration: 0.5 }}
      >
         <Card
            style={{
               marginBottom: 24,
               borderRadius: 16,
               overflow: "hidden",
               boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
               border: "none",
               background: "linear-gradient(135deg, #f0f2f5 0%, white 100%)",
            }}
         >
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
               <Space align="center">
                  <ProfileOutlined
                     style={{
                        fontSize: 24,
                        color: "#1890ff",
                        backgroundColor: "#e6f7ff",
                        padding: 8,
                        borderRadius: 8,
                     }}
                  />
                  <div>
                     <Title level={4} style={{ margin: 0 }}>
                        Биография
                     </Title>
                     {(name || specialization) && (
                        <Text type="secondary">
                           {name}
                           {specialization && (
                              <>
                                 {name && " • "}
                                 {specialization}
                              </>
                           )}
                        </Text>
                     )}
                  </div>
               </Space>

               <Divider style={{ margin: "12px 0" }} />

               <div style={{ position: "relative" }}>
                  <Paragraph
                     style={{
                        fontSize: 16,
                        lineHeight: 1.6,
                        color: "rgba(0, 0, 0, 0.85)",
                        margin: 0,
                     }}
                  >
                     <AnimatePresence mode="wait">
                        <motion.div
                           key={showMore ? "full" : "truncated"}
                           initial={{ opacity: 0 }}
                           animate={{ opacity: 1 }}
                           exit={{ opacity: 0 }}
                           transition={{ duration: 0.2 }}
                        >
                           {showMore ? bio : truncatedBio}
                           {!showMore && shouldShowButton && "..."}
                        </motion.div>
                     </AnimatePresence>
                  </Paragraph>

                  {shouldShowButton && (
                     <div
                        style={{
                           marginTop: 16,
                           textAlign: "center",
                        }}
                     >
                        <Button
                           type="text"
                           onClick={() => setShowMore(!showMore)}
                           icon={showMore ? <UpOutlined /> : <DownOutlined />}
                           style={{
                              color: "#1890ff",
                              fontWeight: 500,
                              display: "flex",
                              alignItems: "center",
                              margin: "0 auto",
                           }}
                        >
                           {showMore ? "Скрыть" : "Читать далее"}
                        </Button>
                     </div>
                  )}
               </div>
            </Space>
         </Card>
      </motion.div>
   );
};
