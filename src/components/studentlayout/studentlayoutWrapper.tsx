import { Layout } from 'antd';
import StudentAppHeader from './studentHeader';
import StudentAppSidebar from './studentSidebar';
const { Content } = Layout;

interface LayoutWrapperProps {
  children: React.ReactNode;
  pageTitle: string;
}

const StudentLayoutWrapper = ({ children, pageTitle }: LayoutWrapperProps) => {
  return (
    <Layout style={{ minHeight: '100vh', display: 'flex', overflowX: 'hidden' }}>
      <StudentAppSidebar />
      <Layout>
        <StudentAppHeader title={pageTitle} />
        <Content style={{ 
          padding: '20px', 
          background: '#F5F5F5',
          overflow: 'auto'
        }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default StudentLayoutWrapper;