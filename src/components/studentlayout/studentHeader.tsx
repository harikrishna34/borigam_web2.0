import { Layout, Typography, Avatar, Dropdown, MenuProps, Space } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { useState } from "react";

const { Header } = Layout;
const { Title, Text } = Typography;

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  metaInfo?: string;
  user?: {
    name: string;
    email: string;
    role?: string;
  };
}

const StudentAppHeader = ({
  title,
  subtitle = "INSTITUTION",
  user,
}: AppHeaderProps) => {
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const items: MenuProps["items"] = [
    {
      key: "profile",
      label: (
        <div style={{ padding: "8px 12px" }}>
          <Text strong>{user?.name || "User Name"}</Text>
          <br />
          <Text type="secondary">{user?.email || "user@example.com"}</Text>
          {user?.role && (
            <>
              <br />
              <Text type="secondary">{user.role}</Text>
            </>
          )}
        </div>
      ),
    },
  ];

  function handleMenuClick(): void {
    throw new Error("Function not implemented.");
  }

  return (
    <Header
      style={{
        background: "white",
        padding: "0 20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        height: "64px",
        borderBottom: "1px solid #f0f0f0",
        
      }}
    >
      <div style={{ display: "flex", flexDirection: "column" }}>
        <Title level={4} style={{ color: "black", margin: 0 }}>
          {title}
        </Title>
        <Title
          level={5}
          style={{ color: "black", margin: 0, fontWeight: "normal" }}
        >
          {subtitle}
        </Title>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <Dropdown
          menu={{ items, onClick: handleMenuClick }}
          placement="bottomRight"
          arrow
          open={dropdownVisible}
          onOpenChange={(visible) => setDropdownVisible(visible)}
        >
          <Space style={{ cursor: "pointer" }}>
            <Avatar
              style={{
                height: "40px",
                width: "40px",
                background: "grey",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontSize: "20px",
                color: "white",
                cursor: "pointer",
              }}
              icon={<UserOutlined />}
            />
          </Space>
        </Dropdown>
      </div>
    </Header>
  );
};

export default StudentAppHeader;
