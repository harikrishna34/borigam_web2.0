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
  Checkbox,
} from "antd";
import StudentLayoutWrapper from "../../components/studentlayout/studentlayoutWrapper";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import TextArea from "antd/es/input/TextArea";
import { useParams } from "react-router-dom";

const { Title, Text } = Typography;

interface Option {
  id: number;
  option_text: string;
  option_image: string | null;
  is_correct?: boolean;
}

interface Question {
  id: number;
  name: string;
  type: string;
  image: string | null;
  options: Option[];
}

interface Submission {
  submission_id: number;
  question_id: number;
  question_name: string;
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
}

interface TestResult {
  totalQuestions: number;
  attempted: number;
  correct: number;
  wrong: number;
  finalScore: string;
  finalResult: string;
  message: string;
}
interface SelectedAnswer {
  optionIds?: number[]; // For multiple-choice questions
  optionId?: number | null; // For single-select questions
  text?: string | null;
}

const TestScreen: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<{
    [key: number]: SelectedAnswer;
  }>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [test, setTest] = useState<Test | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [timerActive, setTimerActive] = useState(true);
  const [seenQuestions, setSeenQuestions] = useState<number[]>([]);
  const [testStarted, setTestStarted] = useState(false);
  const { testId } = useParams<{ testId: string }>();
  // In your state declarations, keep these:

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const axiosConfig = { headers: { token: token || "" } };

  // Prevent context menu and tab switching
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    const handleBlur = () => {
      message.warning("Tab switching is not allowed!");
    };

    window.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("blur", handleBlur);

    return () => {
      window.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("blur", handleBlur);
    };
  }, []);

  // Timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (timerActive && timeLeft > 0) {
      timer = setTimeout(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [timeLeft, timerActive]);

  // Load test and questions
  useEffect(() => {
    const loadTest = async () => {
      try {
        setLoading(true);

        if (!testId) {
          throw new Error("Test ID not found");
        }

        const submissionsResponse = await axios.get(
          `http://localhost:3001/api/testsubmission/getTestQuestionSubmissions?test_id=${testId}`,
          axiosConfig
        );

        const submissions = submissionsResponse.data?.submissions || [];

        // 3. Fetch each question with its options
        const questionsData: Question[] = [];
        for (const submission of submissions) {
          const questionResponse = await axios.get(
            `http://localhost:3001/api/testsubmission/setQuestionStatusUnanswered?test_id=${testId}&question_id=${submission.question_id}`,
            axiosConfig
          );

          questionsData.push(questionResponse.data.question);
        }

        setQuestions(questionsData);

        // Initialize answers
        const initialAnswers: typeof selectedAnswers = {};
        questionsData.forEach((q: Question) => {
          initialAnswers[q.id] = { optionId: null, text: null };
        });
        setSelectedAnswers(initialAnswers);

        setTestStarted(true);
        setTimerActive(true);
      } catch (error) {
        console.error("Error loading test:", error);
        message.error("Failed to load test");
        navigate("/student/dashboard");
      } finally {
        setLoading(false);
      }
    };

    loadTest();
  }, [testId]);

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
      test_id: parseInt(testId),
      answers: Object.entries(selectedAnswers).map(([questionId, answer]) => {
        const question = questions.find((q) => q.id === parseInt(questionId));
        const isMultipleChoice = question?.type === "multiple_choice";

        return {
          question_id: parseInt(questionId),
          option_id: isMultipleChoice ? null : answer.optionId,
          option_ids: isMultipleChoice ? answer.optionIds : null,
          text: answer.text,
        };
      }),
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

  const saveAnswerToServer = async (
    questionId: number,
    answer: SelectedAnswer
  ) => {
    if (!testId) return;

    try {
      const question = questions.find((q) => q.id === questionId);
      const isMultipleChoice = question?.type === "multiple_choice";

      await axios.post(
        "http://localhost:3001/api/testsubmission/submitTest",
        {
          test_id: parseInt(testId),
          question_id: questionId,
          option_id: isMultipleChoice ? null : answer.optionId,
          option_ids: isMultipleChoice ? answer.optionIds : null,
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
      await saveAnswerToServer(currentQ.id, answer);
    }

    if (!seenQuestions.includes(currentQ.id)) {
      setSeenQuestions([...seenQuestions, currentQ.id]);
    }

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
          <Text>Loading test information...</Text>
        </div>
      </StudentLayoutWrapper>
    );
  }
  if (!testStarted && !loading && (!test || questions.length === 0)) {
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
              No Tests Available
            </Title>
            <Text type="secondary">
              There are currently no tests available for you to take.
              <br />
              Please check back later or contact your instructor.
            </Text>
            <div style={{ marginTop: 20 }}>
              <Button
                type="primary"
                onClick={() => navigate("/student/dashboard")}
              >
                Return to Dashboard
              </Button>
            </div>
          </Card>
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

                {currentQuestion?.type === "text" ? (
                  <TextArea
                    placeholder="Type your answer here..."
                    value={selectedAnswers[currentQuestion.id]?.text || ""}
                    onChange={(e) =>
                      setSelectedAnswers({
                        ...selectedAnswers,
                        [currentQuestion.id]: {
                          optionId: null,
                          text: e.target.value,
                        },
                      })
                    }
                    style={{ marginTop: 16 }}
                    rows={4}
                  />
                ) : currentQuestion?.type === "radio" ? (
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
                    value={
                      selectedAnswers[currentQuestion.id]?.optionId || null
                    }
                  >
                    {currentQuestion?.options.map((option) => (
                      <Radio
                        key={option.id}
                        value={option.id}
                        style={{ display: "block", margin: "10px 0" }}
                      >
                        {option.option_text}
                        {option.option_image && (
                          <img
                            src={option.option_image}
                            alt="Option visual"
                            style={{
                              maxWidth: "100%",
                              maxHeight: "100px",
                              marginLeft: "10px",
                            }}
                          />
                        )}
                      </Radio>
                    ))}
                  </Radio.Group>
                ) : currentQuestion?.type === "multiple_choice" ? (
                  <div>
                    {currentQuestion?.options.map((option) => (
                      <div key={option.id} style={{ margin: "10px 0" }}>
                        <Checkbox
                          checked={
                            selectedAnswers[
                              currentQuestion.id
                            ]?.optionIds?.includes(option.id) || false
                          }
                          onChange={(e) => {
                            const currentSelected =
                              selectedAnswers[currentQuestion.id]?.optionIds ||
                              [];
                            let newOptionIds;

                            if (e.target.checked) {
                              newOptionIds = [...currentSelected, option.id];
                            } else {
                              newOptionIds = currentSelected.filter(
                                (id) => id !== option.id
                              );
                            }

                            setSelectedAnswers({
                              ...selectedAnswers,
                              [currentQuestion.id]: {
                                ...selectedAnswers[currentQuestion.id],
                                optionIds: newOptionIds,
                                optionId: null,
                                text: null,
                              },
                            });
                          }}
                        >
                          {option.option_text}
                          {option.option_image && (
                            <img
                              src={option.option_image}
                              alt="Option visual"
                              style={{
                                maxWidth: "100%",
                                maxHeight: "100px",
                                marginLeft: "10px",
                              }}
                            />
                          )}
                        </Checkbox>
                      </div>
                    ))}
                  </div>
                ) : null}
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
                {questions.map((q, index) => {
                  const answered =
                    (selectedAnswers[q.id]?.optionIds?.length || 0) > 0 ||
                    selectedAnswers[q.id]?.optionId !== null ||
                    selectedAnswers[q.id]?.text !== null;
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
          </Col>
        </Row>

        <Modal
          title="Test Result"
          open={isModalVisible}
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
