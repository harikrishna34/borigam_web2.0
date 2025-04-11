import { Layout, Menu, Button } from "antd";
import {
  HomeOutlined,
  SettingOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { Modal } from "antd";
import { useState } from "react";

const { Sider } = Layout;

const StudentAppSidebar = () => {
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleLogout = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
    navigate("/");
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleOnClick = () => {
    console.log("123456")
  };


  return (
    <Sider
      width={80}
      style={{
        background: "#EFE4F0",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <Menu
        mode="vertical"
        theme="light"
        style={{ borderRight: 0 }}
        items={[
          {
            key: "home",
            icon: (
              <HomeOutlined
                style={{ fontSize: "30px" }}
                onClick={() => navigate("/student/dashboard")}
              />
            ),
            style: {
              textAlign: "center",
              height: "64px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            },
          },
          {
            key: "profile",
            icon: (
              <SettingOutlined
                style={{ fontSize: "30px" }}
                onClick={handleOnClick}
              />
            ),
            style: {
              textAlign: "center",
              height: "64px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            },
          },
        ]}
      />

      {/* Logout Button */}
      <div style={{ padding: "10px", textAlign: "center" }}>
        <Button
          type="text"
          icon={<LogoutOutlined style={{ fontSize: "20px" }} />}
          onClick={handleLogout}
          style={{
            width: "100%",
            height: "64px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        />
        <Modal
          title="Confirm Logout"
          open={isModalOpen}
          onOk={handleOk}
          onCancel={handleCancel}
        >
          <p>Are you sure you want to logout?</p>
        </Modal>
      </div>
    </Sider>
  );
};

export default StudentAppSidebar;
