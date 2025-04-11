import React, { useEffect, useState } from "react";
import { Table, Button, Card, Row, Col, Spin, Alert } from "antd";
import StudentLayoutWrapper from "../../components/studentlayout/studentlayoutWrapper";
import { useNavigate } from "react-router-dom";

interface StudentData {
  student_id: number;
  firstname: string;
  lastname: string;
  email: string;
  countrycode: string;
  mobileno: string;
  status: number;
  college_id: number | null;
  college_name: string | null;
  courses: Array<{
    course_id: number;
    course_name: string;
  }>;
  batches: Array<{
    batch_id: number;
    end_date: number;
    batch_name: string;
    start_date: number;
  }>;
  tests: {
    assignedTests: any[];
    completdTests: any[];
    openTest: any[];
  };
}

const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        "http://localhost:3001/api/studentdashbaord/getStudentTestStatus",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            token: token || "",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch student data");
      }

      const data = await response.json();
      if (!data.type) {
        throw new Error(data.message || "Failed to fetch student data");
      }

      setStudentData(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  const columns = [
    { title: "Name", 
      key: "name",
      render: () => `${studentData?.firstname} ${studentData?.lastname}` 
    },
    { title: "Email", dataIndex: "email", key: "email" },
    { 
      title: "Phone", 
      key: "phone",
      render: () => `${studentData?.countrycode} ${studentData?.mobileno}`
    },
    { 
      title: "Enrolled Courses", 
      key: "courses",
      render: () => studentData?.courses.map(c => c.course_name).join(", ") || "N/A"
    },
    { 
      title: "Batch", 
      key: "batch",
      render: () => studentData?.batches.map(b => b.batch_name).join(", ") || "N/A"
    },
    { 
      title: "Batch Start Date", 
      key: "startDate",
      render: () => studentData?.batches[0] ? formatDate(studentData.batches[0].start_date) : "N/A"
    },
    { 
      title: "Batch End Date", 
      key: "endDate",
      render: () => studentData?.batches[0] ? formatDate(studentData.batches[0].end_date) : "N/A"
    },
  ];

  const dataSource = studentData ? [studentData] : [];

  if (loading) {
    return (
      <StudentLayoutWrapper pageTitle={"BORIGAM / Student"}>
        <Spin size="large" style={{ display: "flex", justifyContent: "center", marginTop: "40px" }} />
      </StudentLayoutWrapper>
    );
  }

  if (error) {
    return (
      <StudentLayoutWrapper pageTitle={"BORIGAM / Student"}>
        <Alert message="Error" description={error} type="error" showIcon />
      </StudentLayoutWrapper>
    );
  }

  return (
    <StudentLayoutWrapper pageTitle={"BORIGAM / Student"}>
      <div style={{ marginBottom: "20px" }}>
        {/* Welcome Card */}
        <Card style={{ backgroundColor: "#FFD700", textAlign: "center", marginBottom: "20px" }}>
          <h2 style={{ fontWeight: "bold", fontSize: "20px" }}>
            WELCOME {studentData?.firstname} {studentData?.lastname}
          </h2>
        </Card>

        <Row gutter={16}>
          <Col span={16}>
            <Card
              title="Student Details"
              bordered={false}
              headStyle={{ backgroundColor: "#FFD700", fontWeight: "bold" }}
            >
              <Table
                dataSource={dataSource}
                columns={columns}
                pagination={false}
                style={{ overflowX: "auto" }}
                rowKey="student_id"
              />
            </Card>
          </Col>

          <Col span={8}>
            <Card
              title="Student Tests"
              bordered={false}
              headStyle={{ backgroundColor: "#FFD700", fontWeight: "bold" }}
            >
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Button 
                    type="primary" 
                    block 
                    style={{ marginBottom: "10px" }}
                    onClick={() => navigate("/student/CompletedTest")}
                  >
                    Completed Tests 
                  </Button>
                </Col>
                <Col span={12}>
                  <Button
                    type="primary"
                    block
                    style={{ marginBottom: "10px" }}
                    onClick={() => navigate("/student/TestScreen")}
                  >
                    New Test
                  </Button>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </div>
    </StudentLayoutWrapper>
  );
};

export default StudentDashboard;