import { useEffect, useState } from "react";
import {
  Card,
  Button,
  Typography,
  List,
  Tabs,
  Modal,
  Input,
  Form,
  message,
  Popconfirm,
} from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import LayoutWrapper from "../../../components/adminlayout/layoutWrapper";

const { TabPane } = Tabs;

interface Course {
  id: number;
  name: string;
}

interface Option {
  id: number;
  is_correct: boolean;
  option_text: string;
}

interface Question {
  id: number;
  name: string;
  options: Option[];
}

interface Test {
  test_id: number;
  test_name: string;
  start_date: string;
  questions: Question[];
}

interface Batch {
  batch_id: number;
  name: string;
  course_name: string;
  start_date: string;
  end_date: string;
}

const Settings: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [tests, setTests] = useState<Test[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [courseName, setCourseName] = useState("");

  useEffect(() => {
    fetchCourses();
    fetchTests();
    fetchBatches();
  }, []);

  const fetchCourses = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found, authentication required");
      return;
    }
    try {
      const response = await fetch(
        "http://localhost:3001/api/course/getCourses",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            token,
          },
        }
      );
      if (!response.ok)
        throw new Error(`HTTP error! Status: ${response.status}`);
      const data: Course[] = await response.json();
      setCourses(data);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  const [batches, setBatches] = useState<Batch[]>([]);
  const [isBatchModalVisible, setIsBatchModalVisible] = useState(false);
  const [newBatch, setNewBatch] = useState({
    name: "",
    course_id: undefined as number | undefined,
    start_date: "",
    end_date: "",
  });
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editType, setEditType] = useState<"course" | "batch" | null>(null);
  const [editData, setEditData] = useState<{ id: number; name: string }>({
    id: 0,
    name: "",
  });

  const fetchTests = async () => {
    try {
      const response = await fetch(
        "http://localhost:3001/api/question/viewAllTests",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            token: localStorage.getItem("token") || "",
          },
        }
      );
      if (!response.ok)
        throw new Error(`HTTP error! Status: ${response.status}`);
      const { data }: { data: Test[] } = await response.json();
      setTests(data);
    } catch (error) {
      console.error("Error fetching tests:", error);
    }
  };

  const fetchBatches = async () => {
    try {
      const response = await fetch(
        "http://localhost:3001/api/course/viewAllBatches",
        {
          headers: {
            "Content-Type": "application/json",
            token: localStorage.getItem("token") || "",
          },
        }
      );
      const { data } = await response.json();
      setBatches(data);
    } catch (error) {
      console.error("Error fetching batches:", error);
    }
  };

  const handleAddBatch = async () => {
    const token = localStorage.getItem("token");
    if (
      !newBatch.name ||
      !newBatch.course_id ||
      !newBatch.start_date ||
      !newBatch.end_date
    ) {
      message.warning("Please fill all fields");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:3001/api/course/createBatch",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            token: token || "",
          },
          body: JSON.stringify(newBatch),
        }
      );

      if (!response.ok) throw new Error("Failed to create batch");

      message.success("Batch added successfully");
      setNewBatch({
        name: "",
        course_id: undefined,
        start_date: "",
        end_date: "",
      });
      setIsBatchModalVisible(false);
      fetchBatches();
    } catch (error) {
      console.error("Error creating batch:", error);
      message.error("Error creating batch");
    }
  };

  const handleAddCourse = async () => {
    const token = localStorage.getItem("token");
    if (!courseName.trim()) {
      message.warning("Course name cannot be empty");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:3001/api/course/createCourse",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            token: token || "",
          },
          body: JSON.stringify({ name: courseName }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create course");
      }

      message.success("Course added successfully");
      setCourseName("");
      setIsModalVisible(false);
      fetchCourses();
    } catch (error) {
      console.error("Error creating course:", error);
      message.error("Error creating course");
    }
  };

  const handleEditClick = (
    type: "course" | "batch",
    id: number,
    name: string
  ) => {
    setEditType(type);
    setEditData({ id, name });
    setIsEditModalVisible(true);
  };

  const handleEditSubmit = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      message.error("Authentication required");
      return;
    }

    try {
      let url = "";
      let body = {};

      if (editType === "course") {
        url = `http://localhost:3001/api/course/updateCourse/${editData.id}`;
        body = { name: editData.name };
      } else {
        url = `http://localhost:3001/api/course/updateBatch/${editData.id}`;
        body = { name: editData.name };
      }

      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          token,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error("Failed to update");

      message.success(`${editType} updated successfully`);
      setIsEditModalVisible(false);

      // Refresh data
      if (editType === "course") {
        fetchCourses();
      } else {
        fetchBatches();
      }
    } catch (error) {
      console.error(`Error updating ${editType}:`, error);
      message.error(`Error updating ${editType}`);
    }
  };

  const handleDelete = async (type: "course" | "batch", id: number) => {
    const token = localStorage.getItem("token");
    if (!token) {
      message.error("Authentication required");
      return;
    }

    try {
      const url =
        type === "course"
          ? `http://localhost:3001/api/course/deleteCourse/${id}`
          : `http://localhost:3001/api/course/deleteBatch/${id}`;

      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          token,
        },
      });

      if (!response.ok) throw new Error("Failed to delete");

      message.success(`${type} deleted successfully`);

      // Refresh data
      if (type === "course") {
        fetchCourses();
      } else {
        fetchBatches();
      }
    } catch (error) {
      console.error(`Error deleting ${type}:`, error);
      message.error(`Error deleting ${type}`);
    }
  };

  const renderTests = (filteredTests: Test[]) =>
    Array.isArray(filteredTests) &&
    filteredTests.map((test) => (
      <div key={test.test_id} style={{ marginBottom: "20px" }}>
        <Typography.Title level={5}>{test.test_name}</Typography.Title>
        <List
          bordered
          dataSource={test.questions}
          renderItem={(question) => (
            <List.Item>
              <div>
                <Typography.Text strong>{question.name}</Typography.Text>
                {Array.isArray(question.options) &&
                  question.options.length > 0 && (
                    <List
                      size="small"
                      dataSource={question.options}
                      renderItem={(option) => (
                        <List.Item>
                          {option.option_text}{" "}
                          {option.is_correct && (
                            <strong>(Correct Answer)</strong>
                          )}
                        </List.Item>
                      )}
                    />
                  )}
              </div>
            </List.Item>
          )}
        />
      </div>
    ));

  return (
    <LayoutWrapper pageTitle="BORIGAM / Settings">
      <div
        className="settings"
        style={{
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "20px",
        }}
      >
        <Card
          style={{
            width: "49%",
            borderRadius: "10px",
            borderColor: "#8B5EAB",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <Button
            type="primary"
            onClick={() => setIsModalVisible(true)}
            style={{
              background: "#8B5EAB",
              borderColor: "#8B5EAB",
              width: "100%",
              fontWeight: "bold",
              marginBottom: "20px",
            }}
          >
            View Courses +
          </Button>

          <div
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
              justifyContent: "center",
              marginBottom: "16px",
            }}
          >
            {Array.isArray(courses) &&
              courses.map((course) => (
                <div key={course.id} style={{ position: "relative" }}>
                  <Button
                    style={{
                      width: "200px",
                      height: "100px",
                      fontSize: "22px",
                      padding: "0",
                    }}
                  >
                    {course.name}
                  </Button>
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      right: 0,
                      display: "flex",
                    }}
                  >
                    <Button
                      type="text"
                      icon={<EditOutlined />}
                      style={{ color: "#8B5EAB" }}
                      onClick={() =>
                        handleEditClick("course", course.id, course.name)
                      }
                    />
                    <Popconfirm
                      title="Are you sure to delete this course?"
                      onConfirm={() => handleDelete("course", course.id)}
                      okText="Yes"
                      cancelText="No"
                    >
                      <Button
                        type="text"
                        icon={<DeleteOutlined />}
                        style={{ color: "#ff4d4f" }}
                      />
                    </Popconfirm>
                  </div>
                </div>
              ))}
          </div>
        </Card>
        <Card
          style={{
            width: "49%",
            borderRadius: "10px",
            borderColor: "#8B5EAB",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <Button
            type="primary"
            onClick={() => setIsBatchModalVisible(true)}
            style={{
              background: "#8B5EAB",
              borderColor: "#8B5EAB",
              width: "100%",
              fontWeight: "bold",
              marginBottom: "20px",
            }}
          >
            View Batches +
          </Button>

          <div
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
              justifyContent: "center",
              marginBottom: "16px",
            }}
          >
            {Array.isArray(batches) &&
              batches.map((batch) => (
                <div key={batch.batch_id} style={{ position: "relative" }}>
                  <Button
                    style={{
                      width: "250px",
                      height: "120px",
                      fontSize: "21px",
                      textAlign: "left",
                      padding: "10px",
                      whiteSpace: "normal",
                    }}
                  >
                    <strong>{batch.name}</strong>
                    <br />
                    {batch.course_name}
                  </Button>
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      right: 0,
                      display: "flex",
                    }}
                  >
                    <Button
                      type="text"
                      icon={<EditOutlined />}
                      style={{ color: "#8B5EAB" }}
                      onClick={() =>
                        handleEditClick("batch", batch.batch_id, batch.name)
                      }
                    />
                    <Popconfirm
                      title="Are you sure to delete this batch?"
                      onConfirm={() => handleDelete("batch", batch.batch_id)}
                      okText="Yes"
                      cancelText="No"
                    >
                      <Button
                        type="text"
                        icon={<DeleteOutlined />}
                        style={{ color: "#ff4d4f" }}
                      />
                    </Popconfirm>
                  </div>
                </div>
              ))}
          </div>
        </Card>

        <Card
          style={{
            width: "49%",
            borderRadius: "10px",
            borderColor: "#8B5EAB",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <Button
            type="primary"
            style={{
              background: "#8B5EAB",
              borderColor: "#8B5EAB",
              width: "100%",
              fontWeight: "bold",
              marginBottom: "20px",
            }}
          >
            Question & Answers
          </Button>
          <Tabs defaultActiveKey="1">
            <TabPane tab="All Tests" key="1">
              {renderTests(tests)}
            </TabPane>
            <TabPane tab="Mock Test" key="2">
              {renderTests(
                tests.filter((test) => test.test_name === "Mock Test")
              )}
            </TabPane>
            <TabPane tab="Regular Test" key="3">
              {renderTests(
                tests.filter((test) => test.test_name === "Regular Test")
              )}
            </TabPane>
          </Tabs>
        </Card>
      </div>

      {/* Course Modal */}
      <Modal
        title="Add New Course"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={handleAddCourse}
        okText="Add Course"
      >
        <Form layout="vertical">
          <Form.Item label="Course Name">
            <Input
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              placeholder="Enter course name"
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Batch Modal */}
      <Modal
        title="Add New Batch"
        visible={isBatchModalVisible}
        onCancel={() => setIsBatchModalVisible(false)}
        onOk={handleAddBatch}
        okText="Add Batch"
      >
        <Form layout="vertical">
          <Form.Item label="Batch Name">
            <Input
              value={newBatch.name}
              onChange={(e) =>
                setNewBatch({ ...newBatch, name: e.target.value })
              }
              placeholder="Enter batch name"
            />
          </Form.Item>
          <Form.Item label="Course">
            <select
              className="ant-input"
              value={newBatch.course_id}
              onChange={(e) =>
                setNewBatch({ ...newBatch, course_id: Number(e.target.value) })
              }
              style={{ backgroundColor: "white", color: "black" }}
            >
              <option value="">Select Course</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>
          </Form.Item>
          <Form.Item label="Start Date">
            <Input
              type="date"
              onChange={(e) =>
                setNewBatch({
                  ...newBatch,
                  start_date: new Date(e.target.value)
                    .toLocaleDateString("en-GB")
                    .split("/")
                    .join("-"),
                })
              }
            />
          </Form.Item>
          <Form.Item label="End Date">
            <Input
              type="date"
              onChange={(e) =>
                setNewBatch({
                  ...newBatch,
                  end_date: new Date(e.target.value)
                    .toLocaleDateString("en-GB")
                    .split("/")
                    .join("-"),
                })
              }
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        title={`Edit ${editType}`}
        visible={isEditModalVisible}
        onCancel={() => setIsEditModalVisible(false)}
        onOk={handleEditSubmit}
        okText="Save Changes"
      >
        <Form layout="vertical">
          <Form.Item
            label={`${editType === "course" ? "Course" : "Batch"} Name`}
          >
            <Input
              value={editData.name}
              onChange={(e) =>
                setEditData({ ...editData, name: e.target.value })
              }
              placeholder={`Enter ${editType} name`}
            />
          </Form.Item>
        </Form>
      </Modal>
    </LayoutWrapper>
  );
};

export default Settings;
