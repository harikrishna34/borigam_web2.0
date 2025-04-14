import React, { useEffect, useState } from "react";
import {
  Table,
  Card,
  Typography,
  Spin,
  Alert,
  Tag,
  Space,
  message,
} from "antd";
import StudentLayoutWrapper from "../../components/studentlayout/studentlayoutWrapper";

const { Title, Text } = Typography;

interface CompletedTest {
  test_id: number;
  test_name: string;
  duration: number;
  total_questions: number;
  attempted: number;
  correct: number;
  wrong: number;
  final_score: string;
  final_result: string;
  subject_name: string;
  course_name?: string;
  batch_name?: string;
  start_time?: number;
  created_at?: number;
  end_time?: number;
}

interface Option {
  option_id: number;
  option_text: string;
  is_correct: boolean;
}

interface Answer {
  question_id: number;
  question_text: string;
  submitted_option_id: number;
  is_correct: boolean;
  options: Option[];
}

interface TestResult {
  test_id: number;
  test_name: string;
  total_questions: number;
  attempted: number;
  correct: number;
  wrong: number;
  final_score: string;
  final_result: string;
}

const StudentCompletedTest = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [tests, setTests] = useState<CompletedTest[]>([]);
  const [selectedResult, setSelectedResult] = useState<TestResult | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [error, setError] = useState<string | null>(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchCompletedTests();
  }, []);

  const fetchCompletedTests = async () => {
    try {
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

      if (!response.ok) throw new Error("Failed to fetch completed tests");

      const data = await response.json();
      const completed = data?.data?.tests?.completdTests || [];
      const batches = data?.data?.batches || [];
      const enrichedTests = completed.map((test: any, index: number) => {
        const batch = batches[index] || {};
        return {
          ...test,
          batch_id: batch.batch_id,
          batch_name: batch.batch_name,
        };
      });

      setTests(enrichedTests);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const fetchTestResultById = async (test_id: number) => {
    try {
      setLoading(true);
      setSelectedResult(null);
      setAnswers([]);

      const response = await fetch(
        `http://13.233.33.133:3001/api/testsubmission/getTestResultById?test_id=${test_id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            token: token || "",
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch test result");

      const data = await response.json();
      setSelectedResult(data.result);
      setAnswers(data.answers);
    } catch (err) {
      message.error(
        err instanceof Error ? err.message : "Failed to load test result"
      );
    } finally {
      setLoading(false);
    }
  };

  const testColumns = [
    {
      title: "Test Name",
      dataIndex: "test_name",
      key: "test_name",
    },
    {
      title: "Course",
      dataIndex: "course_name",
      key: "course_name",
    },
    {
      title: "batch",
      dataIndex: "batch_name",
      key: "batch_name",
    },
    {
      title: "Test Date",
      dataIndex: "start_date",
      key: "start_date",
    },
    {
      title: "Created Date",
      dataIndex: "created_at",
      key: "created_at",
    },
    {
      title: "Score",
      dataIndex: "final_score",
      key: "final_score",
      render: (text: string) => `${text}%`,
    },
    {
      title: "Result",
      dataIndex: "final_result",
      key: "final_result",
      render: (text: string) => (
        <Tag color={text === "Pass" ? "green" : "red"}>{text}</Tag>
      ),
    },
  ];

  const questionColumns = [
    {
      title: "Question",
      dataIndex: "question_text",
      key: "question_text",
      render: (text: string, _record: Answer, index: number) => (
        <Text strong>
          {index + 1}. {text}
        </Text>
      ),
      width: "40%",
    },
    {
      title: "Options",
      key: "options",
      render: (record: Answer) => (
        <Space direction="vertical">
          {record.options.map((option) => {
            let color = "default";
            let style: React.CSSProperties = {};
            const isSubmitted = option.option_id === record.submitted_option_id;

            if (isSubmitted) {
              color = record.is_correct ? "green" : "red";
              style = { fontWeight: "bold" };
            } else if (option.is_correct && !record.is_correct) {
              color = "blue";
            }

            return (
              <Tag color={color} style={style} key={option.option_id}>
                {option.option_text}
                {isSubmitted && " (Your Answer)"}
                {option.is_correct && !isSubmitted && " (Correct Answer)"}
              </Tag>
            );
          })}
        </Space>
      ),
      width: "50%",
    },
    {
      title: "Result",
      key: "result",
      align: "center" as const,
      render: (record: Answer) => (
        <Tag color={record.is_correct ? "green" : "red"}>
          {record.is_correct ? "Correct" : "Incorrect"}
        </Tag>
      ),
    },
  ];

  return (
    <StudentLayoutWrapper pageTitle="BORIGAM / Completed Tests">
      <div style={{ padding: "24px" }}>
        <Title level={2}>Completed Tests</Title>

        {error && (
          <Alert
            message="Error"
            description={error}
            type="error"
            showIcon
            style={{ marginBottom: 24 }}
          />
        )}

        {loading ? (
          <Spin
            size="large"
            style={{ display: "flex", justifyContent: "center", marginTop: 40 }}
          />
        ) : (
          <>
            <Card title="Test List" style={{ marginBottom: 24 }}>
              <Table
                dataSource={tests}
                columns={testColumns}
                rowKey="test_id"
                bordered
                onRow={(record) => ({
                  onClick: () => fetchTestResultById(record.test_id),
                })}
                pagination={false}
                style={{ fontSize: 14, width: "100%", cursor: "pointer" }}
              />
            </Card>

            {selectedResult && (
              <>
                <Card title="Test Summary" style={{ marginBottom: 24 }}>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3, 1fr)",
                      gap: "16px",
                    }}
                  >
                    <div>
                      <Text strong>Total Questions:</Text>{" "}
                      {selectedResult.total_questions}
                    </div>
                    <div>
                      <Text strong>Attempted:</Text> {selectedResult.attempted}
                    </div>
                    <div>
                      <Text strong>Correct:</Text> {selectedResult.correct}
                    </div>
                    <div>
                      <Text strong>Wrong:</Text> {selectedResult.wrong}
                    </div>
                    <div>
                      <Text strong>Score:</Text> {selectedResult.final_score}%
                    </div>
                    <div>
                      <Text strong>Result:</Text>{" "}
                      <Tag
                        color={
                          selectedResult.final_result === "Pass"
                            ? "green"
                            : "red"
                        }
                      >
                        {selectedResult.final_result}
                      </Tag>
                    </div>
                  </div>
                </Card>

                <Card title="Question Details">
                  <Table
                    dataSource={answers}
                    columns={questionColumns}
                    rowKey="question_id"
                    pagination={false}
                    bordered
                  />
                </Card>
              </>
            )}
          </>
        )}
      </div>
    </StudentLayoutWrapper>
  );
};

export default StudentCompletedTest;
