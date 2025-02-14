import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "../Card";
import Alert from "../Alert";
import { Loader } from "lucide-react";
import { useStudent } from "../../../../contexts/StudentProfileContext";
import { useNavigate } from "react-router-dom";
import { ExamContext } from "./ExamContext";

const ExamDashboard = () => {
  const { setExamData } = useContext(ExamContext);
  const { studentDetails, loading: studentLoading } = useStudent();

  const [exams, setExams] = useState([]);
  // Use a Set to track exam IDs that are already completed
  const [completedExams, setCompletedExams] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(true);
  const [error, setError] = useState("");

  // Assume these values are stored in localStorage or provided via context
  const location = localStorage.getItem("location");
  const studentId = localStorage.getItem("student_id");
  const batch = studentDetails?.BatchNo;
  const navigate = useNavigate();

  // 1. Fetch available exams from the backend
  useEffect(() => {
    const fetchExams = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/api/v1/get-available-exams?batch=${batch}&location=${location}`
        );
        if (response.data.success) {
          setExams(response.data.exams);
        } else {
          setError(response.data.message || "No exams found.");
        }
      } catch (err) {
        setError("No exams found");
      } finally {
        setLoading(false);
      }
    };

    if (batch && location) {
      fetchExams();
    }
  }, [batch, location]);

  // 2. Fetch exam status (completed exam IDs) from the backend
  useEffect(() => {
    const fetchExamStatus = async () => {
      try {
        setStatusLoading(true);
        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/api/v1/exam-status?studentId=${studentId}&batch=${batch}&location=${location}`
        );
        if (response.data.success && response.data.completedExamIds) {
          setCompletedExams(new Set(response.data.completedExamIds));
        }
      } catch (err) {
        console.error("Error fetching exam status", err);
      } finally {
        setStatusLoading(false);
      }
    };

    if (studentId && batch && location) {
      fetchExamStatus();
    }
  }, [studentId, batch, location]);

  // 3. Categorize exams based on current time
  const categorizeExams = () => {
    const now = new Date();
    const active = [];
    const upcoming = [];
    const finished = [];

    exams.forEach((exam) => {
      // Assume exam.startDate is in "YYYY-MM-DD" format and exam.startTime is in "HH:MM"
      const examStart = new Date(`${exam.startDate}T${exam.startTime}`);
      const examEnd = new Date(
        examStart.getTime() + exam.totalExamTime * 60000
      );

      if (now >= examStart && now <= examEnd) {
        active.push(exam);
      } else if (now < examStart) {
        upcoming.push(exam);
      } else {
        finished.push(exam);
      }
    });

    return { active, upcoming, finished };
  };

  const { active, upcoming, finished } = categorizeExams();

  // 4. Handler to start the exam – requests fullscreen and calls your start exam API
  const handleStartExam = async (examId) => {
    try {
      // Request fullscreen mode
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }

      // Call the start exam API
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/v1/startexam`,
        { examId, batch, studentId, location }
      );

      if (response.data.success) {
        localStorage.setItem("examData", JSON.stringify(response.data));
        setExamData(response.data);
        navigate("/conduct-exam");
      } else {
        console.error("Failed to start exam.");
      }
    } catch (error) {
      console.error("Error starting exam:", error);
    }
  };

  if (loading || studentLoading || statusLoading) {
    return (
      <div className="flex items-center justify-center">
        <Loader className="animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-3xl text-center">
        <Alert>{error}</Alert>
      </div>
    );
  }
  window.addEventListener("popstate", () => {
    window.location.reload();
  });

  return (
    <div className="p-4">
      {/* Active Exams Section */}
      {active.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-green-600 mb-3">
            Active Exams
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {active.map((exam) => (
              <Card
                key={exam.examId}
                className="border border-green-500 cursor-pointer hover:shadow-lg"
              >
                <CardHeader>
                  <CardTitle>Batch: {exam.batch}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    <strong>Start Date:</strong> {exam.startDate}
                  </p>
                  <p>
                    <strong>Start Time:</strong> {exam.startTime}
                  </p>
                  <p>
                    <strong>Total Duration:</strong> {exam.totalExamTime} mins
                  </p>
                  <button
                    type="button"
                    onClick={() => handleStartExam(exam.examId)}
                    disabled={completedExams.has(exam.examId)}
                    className={`focus:outline-none text-white font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 ${
                      completedExams.has(exam.examId)
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300"
                    }`}
                  >
                    {completedExams.has(exam.examId)
                      ? "Already Attempted"
                      : "Start Exam"}
                  </button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Exams Section */}
      {upcoming.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-blue-600 mb-3">
            Upcoming Exams
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcoming.map((exam) => (
              <Card key={exam.examId} className="border border-blue-500">
                <CardHeader>
                  <CardTitle>Batch: {exam.batch}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    <strong>Start Date:</strong> {exam.startDate}
                  </p>
                  <p>
                    <strong>Start Time:</strong> {exam.startTime}
                  </p>
                  <p>
                    <strong>Total Duration:</strong> {exam.totalExamTime} mins
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Finished Exams Section */}
      {finished.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-600 mb-3">
            Finished Exams
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {finished.map((exam) => (
              <Card key={exam.examId} className="border border-gray-500">
                <CardHeader>
                  <CardTitle>Batch: {exam.batch}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    <strong>Start Date:</strong> {exam.startDate}
                  </p>
                  <p>
                    <strong>Start Time:</strong> {exam.startTime}
                  </p>
                  <p>
                    <strong>Total Duration:</strong> {exam.totalExamTime} mins
                  </p>

                  <p className="text-red-500 font-bold">Exam Completed</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamDashboard;
