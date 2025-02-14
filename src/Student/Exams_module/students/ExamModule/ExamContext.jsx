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
  console.log(startDate, startTime, totalExamTime);

  const totalScore = examData?.exam.subjects.reduce((acc, subject) => {
    const mcqScore = subject.MCQs
      ? subject.MCQs.reduce((sum, q) => sum + q.Score, 0)
      : 0;
    const codingScore = subject.Coding
      ? subject.Coding.reduce((sum, q) => sum + q.Score, 0)
      : 0;
    return acc + mcqScore + codingScore;
  }, 0);

  useEffect(() => {
    const storedData = localStorage.getItem("examData");
    if (storedData) {
      setExamData(JSON.parse(storedData));
    }
  }, []);

  useEffect(() => {
    const extractedMCQs = [];
    const extractedCoding = [];

    examData?.exam.subjects.forEach((subject) => {
      if (subject.MCQs && subject.MCQs.length > 0) {
        extractedMCQs.push(
          ...subject.MCQs.map((q) => ({
            ...q,
            answered: false,
            markedForReview: false,
            answer: "",
          }))
        );
      }
      if (subject.Coding && subject.Coding.length > 0) {
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

  const updateMcqAnswer = (index, answer) => {
    setMcqQuestions((prevQuestions) => {
      const updated = [...prevQuestions];
      updated[index] = { ...updated[index], answer, answered: true };
      return updated;
    });
  };

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

  const handlePrevious = () => {
    if (selectedMCQ && mcqIndex > 0) {
      setMcqIndex(mcqIndex - 1);
    } else if (!selectedMCQ && codingIndex > 0) {
      setCodingIndex(codingIndex - 1);
    }
  };

  const handleNext = () => {
    if (selectedMCQ && mcqIndex < mcqQuestions.length - 1) {
      setMcqIndex(mcqIndex + 1);
    } else if (!selectedMCQ && codingIndex < codingQuestions.length - 1) {
      setCodingIndex(codingIndex + 1);
    }
  };

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

    mcqQuestions.forEach((q) => {
      if (q.answered) {
        payload[q.questionId] = {
          selectedOption: q.answer,
        };
      }
    });

    codingQuestions.forEach((q) => {
      if (q.answered) {
        payload[q.questionId] = {
          testCaseSummary: q.testCaseSummary || {},
        };
      }
    });

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/v1/submit-exam`,
        payload
      );

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
      }
    : {};

  return (
    <ExamContext.Provider
      value={{
        setExamData,
        examData,
        studentName,
        studentExamId,
        selectedMCQ,
        setSelectedMCQ,
        mcqIndex,
        setMcqIndex,
        codingIndex,
        setCodingIndex,
        mcqQuestions,
        codingQuestions,
        totalScore,
        updateMcqAnswer,
        updateCodingAnswer,
        handlePrevious,
        handleNext,
        handleMarkReview,
        handleSubmit,
        onlineCompilerQuestion,
        existingData,
        setExistingData,
      }}
    >
      {children}
    </ExamContext.Provider>
  );
};
