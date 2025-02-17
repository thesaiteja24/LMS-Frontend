import React, { createContext, useState, useEffect } from "react";
import { useStudent } from "../../../../contexts/StudentProfileContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export const ExamContext = createContext();

export const ExamProvider = ({ children }) => {
  const navigate = useNavigate();
  const { studentDetails } = useStudent();
  const [examData, setExamData] = useState(null);
  const [existingData, setExistingData] = useState({});
  const [selectedMCQ, setSelectedMCQ] = useState(true);
  const [mcqIndex, setMcqIndex] = useState(0);
  const [codingIndex, setCodingIndex] = useState(0);
  const [mcqQuestions, setMcqQuestions] = useState([]);
  const [codingQuestions, setCodingQuestions] = useState([]);

  const studentName = studentDetails?.name || "Student Name";
  const studentExamId = examData?.exam.studentExamId;
  const startTime = examData?.exam.startTime;
  const startDate = examData?.exam.startDate;
  const totalExamTime = examData?.exam.totalExamTime;

  // Calculate totalScore
  const totalScore = examData?.exam.subjects.reduce((acc, subject) => {
    const mcqScore = subject.MCQs
      ? subject.MCQs.reduce((sum, q) => sum + q.Score, 0)
      : 0;
    const codingScore = subject.Coding
      ? subject.Coding.reduce((sum, q) => sum + q.Score, 0)
      : 0;
    return acc + mcqScore + codingScore;
  }, 0);

  // Load examData from localStorage once
  useEffect(() => {
    const storedData = localStorage.getItem("examData");
    if (storedData) {
      setExamData(JSON.parse(storedData));
    }
  }, []);

  // Extract MCQs and Coding questions for all subjects
  useEffect(() => {
    if (!examData) return;

    const extractedMCQs = [];
    const extractedCoding = [];

    examData?.exam.subjects.forEach((subject) => {
      if (subject.MCQs?.length > 0) {
        extractedMCQs.push(
          ...subject.MCQs.map((q) => ({
            ...q,
            answered: false,
            markedForReview: false,
            answer: "",
          }))
        );
      }
      if (subject.Coding?.length > 0) {
        extractedCoding.push(
          ...subject.Coding.map((q) => ({
            ...q,
            answered: false,
            markedForReview: false,
            answer: "",
          }))
        );
      }
    });

    setMcqQuestions(extractedMCQs);
    setCodingQuestions(extractedCoding);
  }, [examData]);

  // Update MCQ answer
  const updateMcqAnswer = (index, answer) => {
    setMcqQuestions((prevQuestions) => {
      const updated = [...prevQuestions];
      updated[index] = { ...updated[index], answer, answered: true };
      return updated;
    });
  };

  // Update coding answer
  const updateCodingAnswer = (data) => {
    setCodingQuestions((prev) => {
      const updated = [...prev];
      updated[codingIndex] = {
        ...updated[codingIndex],
        ...data,
        answered: true,
      };
      return updated;
    });
  };

  // Go to the previous question, possibly switching sections
  const handlePrevious = () => {
    if (selectedMCQ) {
      // If we're in MCQs and not at the first MCQ, just go back one
      if (mcqIndex > 0) {
        setMcqIndex(mcqIndex - 1);
      } else {
        // If we're at the very first MCQ and there are coding questions, switch to coding
        if (codingQuestions.length > 0) {
          setSelectedMCQ(false);
          setCodingIndex(codingQuestions.length - 1); // Move to last coding question
        }
      }
    } else {
      // If we're in coding and not at the first coding question, just go back one
      if (codingIndex > 0) {
        setCodingIndex(codingIndex - 1);
      } else {
        // If we're at the very first coding question, switch to last MCQ
        if (mcqQuestions.length > 0) {
          setSelectedMCQ(true);
          setMcqIndex(mcqQuestions.length - 1);
        }
      }
    }
  };

  // Go to the next question, possibly switching sections
  const handleNext = () => {
    if (selectedMCQ) {
      // If we're in MCQs and not at the last MCQ, just go to the next one
      if (mcqIndex < mcqQuestions.length - 1) {
        setMcqIndex(mcqIndex + 1);
      } else {
        // If this was the last MCQ, switch to the first coding question (if any exist)
        if (codingQuestions.length > 0) {
          setSelectedMCQ(false);
          setCodingIndex(0);
        }
      }
    } else {
      // If we're in coding and not at the last coding question, go to the next one
      if (codingIndex < codingQuestions.length - 1) {
        setCodingIndex(codingIndex + 1);
      } else {
        // If this was the last coding question, switch back to the first MCQ
        if (mcqQuestions.length > 0) {
          setSelectedMCQ(true);
          setMcqIndex(0);
        }
      }
    }
  };

  // Mark question for review
  const handleMarkReview = () => {
    if (selectedMCQ) {
      setMcqQuestions((prev) => {
        const updated = [...prev];
        updated[mcqIndex] = { ...updated[mcqIndex], markedForReview: true };
        return updated;
      });
    } else {
      setCodingQuestions((prev) => {
        const updated = [...prev];
        updated[codingIndex] = {
          ...updated[codingIndex],
          markedForReview: true,
        };
        return updated;
      });
    }
  };

  // Submit exam data
  const handleSubmit = async () => {
    if (!examData) {
      console.error("No exam data available");
      toast.error("No exam data available");
      return;
    }

    const payload = {
      examId: examData.exam.examId,
      studentExamId: examData.exam.studentExamId,
    };

    // Collect MCQ answers
    mcqQuestions.forEach((q) => {
      if (q.answered) {
        payload[q.questionId] = {
          selectedOption: q.answer,
        };
      }
    });

    // Collect coding answers
    codingQuestions.forEach((q) => {
      if (q.answered) {
        payload[q.questionId] = {
          testCaseSummary: q.testCaseSummary || {},
        };
      }
    });

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/submit-exam`,
        payload
      );

      // Exit fullscreen on submission
      if (document.fullscreenElement) {
        document.exitFullscreen().catch((err) => {
          console.error("Error exiting fullscreen:", err);
        });
      }

      if (response.data.success) {
        toast.success("Exam submitted successfully!");
        navigate("/exam-dashboard");
        localStorage.setItem("warnCount", 0);
      } else {
        toast.error("Submission failed: " + response.data.message);
      }
    } catch (error) {
      toast.error("Error during exam submission: " + error.message);
      console.error("Error during exam submission:", error);
      navigate("/exam-dashboard");
      localStorage.setItem("warnCount", 0);
    }
  };

  // Current coding question for the online compiler
  const currentCodingQuestion = codingQuestions[codingIndex];
  const onlineCompilerQuestion = currentCodingQuestion
    ? {
        question_id: currentCodingQuestion.questionId,
        description: currentCodingQuestion.Question,
        constraints: currentCodingQuestion.Constraints,
        hidden_test_cases: currentCodingQuestion.Hidden_Test_Cases,
        sample_input: currentCodingQuestion.Sample_Input,
        sample_output: currentCodingQuestion.Sample_Output,
        score: currentCodingQuestion.Score,
        type: currentCodingQuestion.Question_Type,
        difficulty: currentCodingQuestion.Difficulty,
        language: currentCodingQuestion.Subject,
      }
    : {};

  return (
    <ExamContext.Provider
      value={{
        // State
        examData,
        setExamData,
        existingData,
        setExistingData,
        mcqQuestions,
        codingQuestions,
        mcqIndex,
        setMcqIndex,
        codingIndex,
        setCodingIndex,
        selectedMCQ,
        setSelectedMCQ,

        // Derived
        studentName,
        studentExamId,
        totalExamTime,
        totalScore,

        // Methods
        handlePrevious,
        handleNext,
        handleMarkReview,
        updateMcqAnswer,
        updateCodingAnswer,
        handleSubmit,

        // Online compiler
        onlineCompilerQuestion,
      }}
    >
      {children}
    </ExamContext.Provider>
  );
};
