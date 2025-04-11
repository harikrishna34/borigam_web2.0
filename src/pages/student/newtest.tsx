import React, { useState, useEffect } from "react";
import {
  Card,
  Radio,
  Button,
  Typography,
  Modal,
  Table,
  message,
  Row,
  Col,
  Space,
  Tag,
  Spin,
  Divider,
} from "antd";
import StudentLayoutWrapper from "../../components/studentlayout/studentlayoutWrapper";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

interface Option {
  id: number;
  option_text: string;
  is_correct: boolean;
}

interface Question {
  image: string | undefined;
  id: number;
  name: string;
  type: string;
  options: Option[];
}

interface Test {
  test_id: number;
  test_name: string;
  duration: number;
  created_at: string;
  start_date: string;
  end_date: string;
  course_id: number | null;
  course_name: string | null;
  result_id: number | null;
  total_questions: number | null;
  attempted: number | null;
  correct: number | null;
  wrong: number | null;
  final_score: string | null;
  final_result: string | null;
}

const TestScreen: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<{
    [key: number]: { optionId: number | null; text: string | null };
  }>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [testId, setTestId] = useState<number | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [openTests, setOpenTests] = useState<Test[]>([]);
  const [selectedTest, setSelectedTest] = useState<Test | null>(null);
  const [showTestList, setShowTestList] = useState(false);
  const [timerActive, setTimerActive] = useState(true);
  const [seenQuestions, setSeenQuestions] = useState<number[]>([]);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const axiosConfig = { headers: { token: token } };

  useEffect(() => {
    fetchTestStatus();
  }, []);

  // Timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (timerActive && timeLeft > 0) {
      timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0 && timerActive) {
      // Auto submit when time runs out
      handleAutoSubmit();
    }
    return () => clearTimeout(timer);
  }, [timeLeft, timerActive]);

  const handleAutoSubmit = async () => {
    setTimerActive(false);
    message.warning("Time's up! Submitting your test...");
    await submitTest();
  };

  const fetchTestStatus = () => {
    setLoading(true);
    axios
      .get(
        "http://localhost:3001/api/studentdashbaord/getStudentTestStatus",
        axiosConfig
      )
      .then((response) => {
        console.log("Test status response:", response.data);
        const openTestsData = response.data?.data?.tests?.openTests || [];
        setOpenTests(openTestsData);

        if (openTestsData.length === 1) {
          handleTestSelect(openTestsData[0]);
        } else if (openTestsData.length > 1) {
          setShowTestList(true);
        } else {
          message.info("No open tests available at this time");
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching test status:", error);
        setLoading(false);
      });
  };

  const handleTestSelect = (test: Test) => {
    setSelectedTest(test);
    setTestId(test.test_id);
    setLoading(true);
    setShowTestList(false);

    axios
      .get(
        `http://localhost:3001/api/question/viewTestByID?id=${test.test_id}`,
        axiosConfig
      )
      .then((response) => {
        setQuestions(response.data.data.questions || []);
        // Initialize selected answers with null values
        const initialAnswers: typeof selectedAnswers = {};
        response.data.data.questions.forEach((q: Question) => {
          initialAnswers[q.id] = { optionId: null, text: null };
        });
        setSelectedAnswers(initialAnswers);
        // Set timer based on test duration (convert minutes to seconds)
        setTimeLeft(test.duration * 60);
        setTimerActive(true);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching questions:", error);
        setLoading(false);
      });
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const submitTest = async () => {
    if (!testId) return;

    setSubmitting(true);
    const payload = {
      test_id: testId,
      answers: Object.entries(selectedAnswers).map(([questionId, answer]) => ({
        question_id: parseInt(questionId),
        option_id: answer.optionId,
        text: answer.text,
      })),
    };

    try {
      const response = await axios.post(
        "http://localhost:3001/api/testsubmission/submitTest",
        payload,
        axiosConfig
      );
      setTestResult(response.data.finalSummary);
      setIsModalVisible(true);
      setTimerActive(false);
    } catch (error) {
      message.error("Error submitting test");
      console.error("Submission error:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const saveAnswerToServer = async (questionId: number, answer: any) => {
    try {
      await axios.post(
        "http://localhost:3001/api/testsubmission/submitTest",
        {
          question_id: questionId,
          option_id: answer.optionId,
          text: answer.text,
        },
        axiosConfig
      );
    } catch (error) {
      console.error("Failed to save answer", error);
    }
  };

  const handleNext = async () => {
    const currentQ = questions[currentQuestionIndex];
    const answer = selectedAnswers[currentQ.id];

    if (answer.optionId || answer.text) {
      await saveAnswerToServer(currentQ.id, answer); // ✅ save answer silently
    }

    if (!seenQuestions.includes(currentQ.id)) {
      setSeenQuestions([...seenQuestions, currentQ.id]);
    }

    // ✅ Just move to the next question without submitting
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleModalOk = () => {
    setIsModalVisible(false);
    navigate("/student/dashboard");
  };

  const formatDate = (timestamp: string) => {
    return new Date(parseInt(timestamp) * 1000).toLocaleString();
  };

  const currentQuestion: Question | undefined = questions[currentQuestionIndex];

  if (loading) {
    return (
      <StudentLayoutWrapper pageTitle="Test">
        <div style={{ padding: "20px", textAlign: "center" }}>
          <Spin size="large" />
          <Text>Loading...</Text>
        </div>
      </StudentLayoutWrapper>
    );
  }

  if (showTestList) {
    return (
      <StudentLayoutWrapper pageTitle="Available Tests">
        <div style={{ padding: "20px" }}>
          <Title
            level={2}
            style={{ textAlign: "center", marginBottom: "24px" }}
          >
            Available Tests
          </Title>
          <Row gutter={[16, 16]}>
            {openTests.map((test) => (
              <Col xs={24} sm={12} md={8} lg={6} key={test.test_id}>
                <Card
                  title={test.test_name}
                  bordered={true}
                  hoverable
                  style={{ height: "100%" }}
                  actions={[
                    <Button
                      type="primary"
                      onClick={() => handleTestSelect(test)}
                    >
                      Start Test
                    </Button>,
                  ]}
                >
                  <Space direction="vertical" size="middle">
                    <div>
                      <Text strong>Duration: </Text>
                      <Text>{test.duration} minutes</Text>
                    </div>
                    <div>
                      <Text strong>Course: </Text>
                      <Text>{test.course_name || "General"}</Text>
                    </div>
                    <div>
                      <Text strong>Available Until: </Text>
                      <Text>{formatDate(test.end_date)}</Text>
                    </div>
                    {test.total_questions && (
                      <div>
                        <Text strong>Questions: </Text>
                        <Text>{test.total_questions}</Text>
                      </div>
                    )}
                    {test.final_result && (
                      <Tag
                        color={
                          test.final_result === "Pass" ? "green" : "volcano"
                        }
                      >
                        {test.final_result}
                      </Tag>
                    )}
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </StudentLayoutWrapper>
    );
  }

  if (openTests.length === 0) {
    return (
      <StudentLayoutWrapper pageTitle="Test">
        <div
          style={{
            height: "70vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
          }}
        >
          <Card
            style={{
              textAlign: "center",
              padding: "40px",
              border: "2px dashed #FFA500",
              borderRadius: "16px",
              backgroundColor: "#fffbe6",
            }}
          >
            <Title level={2} style={{ color: "#fa8c16" }}>
              No Open Tests Available
            </Title>
            <Text type="secondary">
              Please check back later or contact your instructor.
            </Text>
          </Card>
        </div>
      </StudentLayoutWrapper>
    );
  }

  if (!testId || questions.length === 0) {
    return (
      <StudentLayoutWrapper pageTitle="Test">
        <div style={{ padding: "20px", textAlign: "center" }}>
          <Text>No questions available for this test</Text>
        </div>
      </StudentLayoutWrapper>
    );
  }

  return (
    <StudentLayoutWrapper pageTitle="Test">
      <div style={{ padding: "20px" }}>
        <Row gutter={16}>
          <Col xs={24} lg={18}>
            <Card>
              <Title level={2}>{selectedTest?.test_name}</Title>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "10px",
                }}
              >
                <Text>Total Questions: {questions.length}</Text>
                <Text>
                  Attempted:{" "}
                  {
                    Object.values(selectedAnswers).filter(
                      (answer) =>
                        answer.optionId !== null || answer.text !== null
                    ).length
                  }
                  /{questions.length}
                </Text>
                <Text style={{ color: "red" }}>
                  Time Remaining: {formatTime(timeLeft)}
                </Text>
              </div>
              <Divider />
              <div style={{ marginBottom: 20 }}>
                <Title level={4}>
                  {currentQuestionIndex + 1}. {currentQuestion?.name}
                </Title>
                {currentQuestion?.image && (
                  <img
                    src={currentQuestion.image}
                    alt="Question visual"
                    style={{
                      width: "100%",
                      height: "200px",
                      objectFit: "contain",
                    }}
                  />
                )}
                <Radio.Group
                  onChange={(e) =>
                    setSelectedAnswers({
                      ...selectedAnswers,
                      [currentQuestion.id]: {
                        optionId: e.target.value,
                        text: null,
                      },
                    })
                  }
                  value={selectedAnswers[currentQuestion.id]?.optionId || null}
                >
                  {currentQuestion?.options.map((option) => (
                    <Radio
                      key={option.id}
                      value={option.id}
                      style={{ display: "block", margin: "10px 0" }}
                    >
                      {option.option_text}
                    </Radio>
                  ))}
                </Radio.Group>
              </div>

              <Space>
                <Button
                  type="primary"
                  onClick={handlePrevious}
                  disabled={currentQuestionIndex === 0 || submitting}
                >
                  Previous
                </Button>
                <Button
                  type="primary"
                  onClick={
                    currentQuestionIndex === questions.length - 1
                      ? submitTest
                      : handleNext
                  }
                  disabled={submitting}
                >
                  {submitting ? (
                    <Spin size="small" />
                  ) : currentQuestionIndex === questions.length - 1 ? (
                    "Submit"
                  ) : (
                    "Next"
                  )}
                </Button>
              </Space>
            </Card>
          </Col>

          {/* Question Number Grid */}
          <Col xs={24} lg={6}>
            <Card title="Answer Status" bordered>
              <Space direction="vertical" size="small">
                <Space>
                  <div
                    style={{ background: "#52c41a", width: 20, height: 20 }}
                  />{" "}
                  <Text>Attempted</Text>
                </Space>
                <Space>
                  <div
                    style={{ background: "#1890ff", width: 20, height: 20 }}
                  />{" "}
                  <Text>Seen but Not Answered</Text>
                </Space>
                <Space>
                  <div
                    style={{ background: "#faad14", width: 20, height: 20 }}
                  />{" "}
                  <Text>Not Seen</Text>
                </Space>
              </Space>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(5, 1fr)",
                  gap: 10,
                  marginTop: 20,
                }}
              >
                {Array.isArray(questions) &&
                  questions.map((q, index) => {
                    const answered = selectedAnswers[q.id]?.optionId !== null;
                    const seen = seenQuestions.includes(q.id);

                    let bgColor = "#faad14"; // Gold
                    let textColor = "#000";

                    if (answered) {
                      bgColor = "#52c41a";
                      textColor = "#fff";
                    } else if (seen) {
                      bgColor = "#1890ff";
                      textColor = "#fff";
                    }

                    return (
                      <Button
                        key={q.id}
                        type="default"
                        style={{
                          backgroundColor: bgColor,
                          color: textColor,
                        }}
                        onClick={() => {
                          setCurrentQuestionIndex(index);
                          if (!seenQuestions.includes(q.id)) {
                            setSeenQuestions([...seenQuestions, q.id]);
                          }
                        }}
                      >
                        {index + 1}
                      </Button>
                    );
                  })}
              </div>
            </Card>
            <Card>
              <Space direction="vertical" size="large">
                <h2>Question {currentQuestionIndex + 1}</h2>
                
              </Space>
            </Card>
          </Col>
        </Row>

        {/* Result Modal stays unchanged */}
        <Modal
          title="Test Result"
          visible={isModalVisible}
          onOk={handleModalOk}
          onCancel={handleModalOk}
          okText="OK"
          width={800}
          footer={[
            <Button key="submit" type="primary" onClick={handleModalOk}>
              OK
            </Button>,
          ]}
        >
          {testResult && (
            <Table
              dataSource={[
                {
                  key: "1",
                  label: "Total Questions",
                  value: testResult.totalQuestions,
                },
                { key: "2", label: "Attempted", value: testResult.attempted },
                { key: "3", label: "Correct", value: testResult.correct },
                { key: "4", label: "Wrong", value: testResult.wrong },
                {
                  key: "5",
                  label: "Final Score",
                  value: `${testResult.finalScore}%`,
                },
                {
                  key: "6",
                  label: "Final Result",
                  value: testResult.finalResult,
                },
              ]}
              columns={[
                { title: "Details", dataIndex: "label", key: "label" },
                { title: "Result", dataIndex: "value", key: "value" },
              ]}
              pagination={false}
              bordered
            />
          )}
        </Modal>
      </div>
    </StudentLayoutWrapper>
  );
};

export default TestScreen;
