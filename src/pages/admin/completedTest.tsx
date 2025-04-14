import { useEffect, useState } from "react";
import { Table, Spin, Button } from "antd";
import { useNavigate } from "react-router-dom";
import LayoutWrapper from "../../components/adminlayout/layoutWrapper";

interface TestResult {
  test_id: number;
  test_name: string;
  duration: number;
  created_at: string;
  start_date: string;
  end_date: string;
  subject_id: number;
  subject_name: string;
  result_id: number;
  total_questions: number;
  attempted: number;
  correct: number;
  wrong: number;
  final_score: string;
  final_result: string;
}

interface StudentTestData {
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
    assignedTests: TestResult[];
    completdTests: TestResult[];
    openTest: TestResult[];
  };
}

const CompletedTest = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [testData, setTestData] = useState<StudentTestData | null>(null);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchTestData();
  }, []);

  const fetchTestData = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "http://13.233.33.133:3001/api/studentdashbaord/getStudentTestStatus",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            token: token || "",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      setTestData(data.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching test data:", error);
      setLoading(false);
    }
  };

  const formatDate = (timestamp: string) => {
    return new Date(parseInt(timestamp) * 1000).toLocaleDateString();
  };

  const columns = [
    {
      title: "Test Name",
      dataIndex: "test_name",
      key: "test_name",
    },
    {
      title: "Subject",
      dataIndex: "subject_name",
      key: "subject_name",
    },
    {
      title: "Duration (mins)",
      dataIndex: "duration",
      key: "duration",
    },
    {
      title: "Start Date",
      key: "start_date",
      render: (record: TestResult) => formatDate(record.start_date),
    },
    {
      title: "End Date",
      key: "end_date",
      render: (record: TestResult) => formatDate(record.end_date),
    },
    {
      title: "Score",
      key: "final_score",
      render: (record: TestResult) => `${record.final_score}%`,
    },
    {
      title: "Result",
      dataIndex: "final_result",
      key: "final_result",
      render: (text: string) => (
        <span style={{ color: text === "Pass" ? "green" : "red" }}>{text}</span>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (record: TestResult) => (
        <Button
          type="primary"
          onClick={() => navigate(`/test-result/${record.test_id}`)}
        >
          View Result
        </Button>
      ),
    },
  ];

  return (
    <LayoutWrapper pageTitle={"BORIGAM / Completed Test"}>
      <div className="completed-test" style={{ padding: "20px" }}>
        {loading ? (
          <Spin size="large" style={{ display: "flex", justifyContent: "center", marginTop: "20px" }} />
        ) : (
          <Table
            dataSource={testData?.tests?.completdTests || []}
            columns={columns}
            rowKey="test_id"
            bordered
            pagination={{ pageSize: 10 }}
            style={{ marginTop: "20px" }}
          />
        )}
      </div>
    </LayoutWrapper>
  );
};

export default CompletedTest;