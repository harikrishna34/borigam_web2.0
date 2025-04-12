import React, { useEffect, useState } from "react";
import {
  Table,
  Spin,
  Tag,
  Modal,
  Form,
  Input,
  Button,
  message,
} from "antd";
import { EditOutlined } from "@ant-design/icons";
import LayoutWrapper from "../../components/adminlayout/layoutWrapper";


// Define TypeScript interfaces
interface Course {
  course_id: number;
  course_name: string;
}

interface Batch {
  batch_id: number;
  batch_name: string;
  start_date: number;
  end_date: number;
}

interface Student {
  student_id: number;
  firstname: string;
  lastname: string;
  email: string;
  countrycode: string;
  mobileno: string;
  college_name: string | null;
  courses: Course[];
  batches: Batch[];
}

const AllStudents: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [form] = Form.useForm();

  // Fetch student data from API
  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = () => {
    setLoading(true);
    fetch("http://localhost:3001/api/student/getAllStudents", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        token: localStorage.getItem("token") || "",
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setStudents(data.data || []);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching students:", error);
        setLoading(false);
      });
  };

  // Format date from timestamp
  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  // Show edit modal
  const showEditModal = (student: Student) => {
    setEditingStudent(student);
    form.setFieldsValue({
      firstname: student.firstname,
      lastname: student.lastname,
      email: student.email,
      countrycode: student.countrycode,
      mobileno: student.mobileno,
      college_name: student.college_name,
    });
    setIsModalVisible(true);
  };

  // Handle modal cancel
  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // Update student via API
      const response = await fetch(
        `http://localhost:3001/api/student/updateStudent/${editingStudent?.student_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            token: localStorage.getItem("token") || "",
          },
          body: JSON.stringify(values),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      message.success("Student updated successfully");
      setIsModalVisible(false);
      fetchStudents(); // Refresh the student list
    } catch (error) {
      console.error("Error updating student:", error);
      message.error("Failed to update student");
    } finally {
      setLoading(false);
    }
  };

  // Define table columns
  const columns = [
    {
      title: "Student Name",
      key: "studentName",
      render: (_: unknown, record: Student) =>
        `${record.firstname} ${record.lastname}`,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Phone Number",
      key: "phoneNumber",
      render: (_: unknown, record: Student) =>
        `${record.countrycode} ${record.mobileno}`,
    },
    {
      title: "College Name",
      key: "collegeName",
      render: (_: unknown, record: Student) => record.college_name || "N/A",
    },
    {
      title: "Courses",
      key: "courses",
      render: (_: unknown, record: Student) => (
        <div>
          {record.courses.map((course) => (
            <Tag color="blue" key={course.course_id}>
              {course.course_name}
            </Tag>
          ))}
        </div>
      ),
    },
    {
      title: "Batches",
      key: "batches",
      render: (_: unknown, record: Student) => (
        <div>
          {record.batches.map((batch) => (
            <div key={batch.batch_id} style={{ marginBottom: 4 }}>
              <Tag color="green">{batch.batch_name}</Tag>
              <div style={{ fontSize: 12 }}>
                {formatDate(batch.start_date)} to {formatDate(batch.end_date)}
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_: unknown, record: Student) => (
        <Button
          type="link"
          icon={<EditOutlined />}
          onClick={() => showEditModal(record)}
        />
      ),
    },
  ];

  return (
    <LayoutWrapper pageTitle="BORIGAM / All Students ">
      <div
        className="enrolled-students-container"
        style={{
          borderRadius: "10px",
          overflow: "hidden",
          background: "white",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
          padding: "10px",
        }}
      >
        <div
          className="header"
          style={{
            backgroundColor: "gold",
            color: "black",
            fontSize: "18px",
            fontWeight: "bold",
            padding: "10px",
            textAlign: "center",
          }}
        >
          All Students
        </div>
        {loading ? (
          <Spin
            size="large"
            className="loading-spinner"
            style={{
              display: "flex",
              justifyContent: "center",
              padding: "20px",
            }}
          />
        ) : (
          <Table
            dataSource={students}
            columns={columns}
            rowKey="student_id"
            bordered
            pagination={{ pageSize: 5 }}
          />
        )}

        {/* Edit Student Modal */}
        <Modal
          title="Edit Student Details"
          visible={isModalVisible}
          onOk={handleSubmit}
          onCancel={handleCancel}
          footer={[
            <Button key="back" onClick={handleCancel}>
              Cancel
            </Button>,
            <Button
              key="submit"
              type="primary"
              loading={loading}
              onClick={handleSubmit}
            >
              Update
            </Button>,
          ]}
        >
          <Form form={form} layout="vertical">
            <Form.Item
              name="firstname"
              label="First Name"
              rules={[{ required: true, message: "Please input first name!" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="lastname"
              label="Last Name"
              rules={[{ required: true, message: "Please input last name!" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: "Please input email!" },
                { type: "email", message: "Please enter a valid email!" },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="countrycode"
              label="Country Code"
              rules={[
                { required: true, message: "Please input country code!" },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="mobileno"
              label="Mobile Number"
              rules={[
                { required: true, message: "Please input mobile number!" },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item name="college_name" label="College Name">
              <Input />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </LayoutWrapper>
  );
};

export default AllStudents;
