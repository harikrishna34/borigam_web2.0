import { Layout, Typography, Avatar, Dropdown, MenuProps, Space } from "antd";
import {
  UserOutlined,
  CheckOutlined,
  EditOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const { Header } = Layout;
const { Title, Text } = Typography;

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  metaInfo?: string;
}

interface UserProfile {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  countrycode: string;
  mobileno: string;
  status: string;
  role: string;
}

const AppHeader = ({ title, subtitle = "INSTITUTION" }: AppHeaderProps) => {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "http://localhost:3001/api/users/myprofile",
          {
            headers: {
              token: token || "",
            },
          }
        );
        setUserProfile(response.data);
      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleMenuClick: MenuProps["onClick"] = (e) => {
    switch (e.key) {
      case "edit-profile":
        // Handle edit profile
        break;
      case "change-password":
        // Handle change password
        break;
      case "logout":
        localStorage.removeItem("token");
        navigate("/login");
        break;
      default:
        break;
    }
    setDropdownVisible(false);
  };

  const menuItems: MenuProps["items"] = [
    {
      key: "user-info",
      label: (
        <Space direction="vertical" size={0} style={{ padding: "12px 16px" }}>
          <Text strong style={{ fontSize: 16 }}>
            {userProfile
              ? `${userProfile.firstname.charAt(
                  0
                )}${userProfile.lastname.charAt(0)}`
              : "UU"}
          </Text>
          <Text strong>
            {userProfile
              ? `${userProfile.firstname} ${userProfile.lastname}`
              : "User Name"}
          </Text>
          <Text type="secondary">
            {userProfile?.email || "user@example.com"}
          </Text>
        </Space>
      ),
      disabled: true,
    },
    { type: "divider" },
    {
      key: "edit-profile",
      icon: <CheckOutlined />,
      label: "Edit Profile",
    },
    {
      key: "change-password",
      icon: <EditOutlined />,
      label: "Change Password",
    },
    { type: "divider" },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Logout",
      danger: true,
    },
  ];

  return (
    <Header
      style={{
        background: "white",
        padding: "0 20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        height: "64px",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
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
        {!loading && (
          <Dropdown
            menu={{ items: menuItems, onClick: handleMenuClick }}
            placement="bottomRight"
            trigger={["click"]}
            open={dropdownVisible}
            onOpenChange={setDropdownVisible}
            overlayStyle={{ minWidth: 220 }}
          >
            <Space style={{ cursor: "pointer", padding: "8px" }}>
              <Avatar
                size="large"
                style={{
                  backgroundColor: "grey",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "16px",
                }}
              >
                {userProfile ? (
                  `${userProfile.firstname.charAt(
                    0
                  )}${userProfile.lastname.charAt(0)}`
                ) : (
                  <UserOutlined />
                )}
              </Avatar>
            </Space>
          </Dropdown>
        )}
      </div>
    </Header>
  );
};

export default AppHeader;
