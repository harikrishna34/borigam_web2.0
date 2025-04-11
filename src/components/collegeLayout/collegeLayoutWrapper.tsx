import { Layout } from "antd";
import CollegeHeader from "./collegeHeader";
import CollegeSidebar from "./collegeSidebar";

const { Content } = Layout;

interface LayoutWrapperProps {
  children: React.ReactNode;
  pageTitle: string;
}

const CollegeLayoutWrapper = ({ children, pageTitle }: LayoutWrapperProps) => {
  return (
    <Layout
      style={{ minHeight: "100vh", display: "flex", overflowX: "hidden" }}
    >
      <CollegeSidebar />
      <Layout>
        <CollegeHeader title={pageTitle} />
        <Content
          style={{
            padding: "20px",
            background: "#F5F5F5",
            overflow: "auto",
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default CollegeLayoutWrapper;
