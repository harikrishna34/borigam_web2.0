import { useEffect, useState } from "react";
import {
  Form,
  Select,
  Button,
  Card,
  Input,
  message,
  Modal,
  Typography,
} from "antd";

import LayoutWrapper from "../../../components/adminlayout/layoutWrapper";
const { Option } = Select;
const { Text } = Typography;

interface Course {
  id: number;
  name: string;
  status: string;
}

// Utility function to format dates

const AddQuestions = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const questionTypes = ["radio"];
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [questionText, setQuestionText] = useState<string>("");
  const [questionType, setQuestionType] = useState<string>("");
  const [options, setOptions] = useState([
    { option_text: "", is_correct: false },
    { option_text: "", is_correct: false },
    { option_text: "", is_correct: false },
    { option_text: "", is_correct: false },
  ]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch courses
        const coursesResponse = await fetch(
          "http://localhost:3001/api/course/getCourses",
          {
            headers: {
              "Content-Type": "application/json",
              token: localStorage.getItem("token") || "",
            },
          }
        );

        if (!coursesResponse.ok) throw new Error("Failed to fetch courses");
        const coursesData = await coursesResponse.json();
        setCourses(coursesData);
      } catch (error) {
        console.error("Error fetching data:", error);
        message.error("Failed to load data");
      }
    };

    fetchData();
  }, []);

  const handleOptionChange = (index: number, text: string) => {
    setOptions((prev) =>
      prev.map((opt, i) => (i === index ? { ...opt, option_text: text } : opt))
    );
  };

  const handleCorrectOptionChange = (index: number) => {
    setOptions((prev) =>
      prev.map((opt, i) => ({ ...opt, is_correct: i === index }))
    );
  };

  const handleSubmit = async () => {
    if (!questionText || !questionType || !selectedCourseId) {
      message.error("Please fill in all required fields.");
      return;
    }

    const formData = new FormData();
    formData.append("name", questionText);
    formData.append("type", questionType.toLowerCase().replace(" ", "_"));
    formData.append("course_id", selectedCourseId.toString());
    formData.append(
      "options",
      JSON.stringify(options.filter((opt) => opt.option_text.trim() !== ""))
    );

    if (imageFile) {
      formData.append("image", imageFile);
    }

    try {
      const response = await fetch(
        "http://localhost:3001/api/question/createQuestion",
        {
          method: "POST",
          headers: {
            token: localStorage.getItem("token") || "",
          },
          body: formData,
        }
      );

      if (!response.ok) throw new Error("Failed to submit question");

      message.success("Question added successfully!");
      setIsModalVisible(true);
    } catch (error) {
      console.error("Error submitting question:", error);
      message.error("Failed to add question.");
    }
  };

  const handleModalOk = () => {
    setIsModalVisible(false);
    window.location.reload();
  };

  return (
    <LayoutWrapper pageTitle="BORIGAM / Add Question">
      <Card className="w-1/2 mx-auto p-6">
        <Form layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="Select Course:"
            name="course"
            rules={[{ required: true }]}
          >
            <Select
              onChange={(value) => {
                const selectedCourse = courses.find(
                  (course) => course.name === value
                );
                setSelectedCourse(selectedCourse?.name || "");
                setSelectedCourseId(selectedCourse?.id || null);
              }}
              value={selectedCourse}
              placeholder="Select Course"
            >
              {courses.map((course) => (
                <Option key={course.id} value={course.name}>
                  {course.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Add Question:" required>
            <Input
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="Enter your question"
            />
          </Form.Item>
          <Form.Item label="Upload Question Image (optional)">
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            />
          </Form.Item>

          <Form.Item
            label="Select Question Type:"
            name="questionType"
            rules={[{ required: true }]}
          >
            <Select
              onChange={setQuestionType}
              value={questionType}
              placeholder="Select"
            >
              {questionTypes.map((type) => (
                <Option key={type} value={type}>
                  {type}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {questionType === "radio" && (
            <>
              {options.map((option, index) => (
                <Form.Item key={index} label={`Answer Option ${index + 1}:`}>
                  <Input
                    value={option.option_text}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={`Enter option ${index + 1}`}
                  />
                  <input
                    type="radio"
                    name="correctOption"
                    checked={option.is_correct}
                    onChange={() => handleCorrectOptionChange(index)}
                  />
                  Correct Answer
                </Form.Item>
              ))}
            </>
          )}

          <Button type="primary" htmlType="submit" className="mt-4">
            Submit
          </Button>
        </Form>
      </Card>

      <Modal
        title="Success"
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalOk}
        okText="OK"
      >
        <p>Question added successfully!</p>
        {selectedCourse && (
          <Text type="secondary">Course: {selectedCourse}</Text>
        )}
        <br />
      </Modal>
    </LayoutWrapper>
  );
};

export default AddQuestions;
