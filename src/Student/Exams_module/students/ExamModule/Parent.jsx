import React, { useState, useEffect } from "react";
import CountdownTimer from "./CountdownTimer";
import { ExamLegend } from "./ExamLegend";
import QNavigation from "./QNavigation"; // Import the new component

export const Parent = () => {
  const examData = {
    success: true,
    exam: {
      studentExamId: "176e8cf3-a24d-42d9-b25f-7150385fe7a4",
      examId: "858d3365-37ff-413e-9953-83d06d2a7221",
      batch: "JFS-108",
      studentId: "b1a7af12-8e1d-40d9-8a17-065b3c6e4186",
      location: "hyderabad",
      startDate: "2025-02-12",
      startTime: "15:06",
      totalExamTime: 36,
      subjects: [
        {
          subject: "java",
          MCQs: [
            {
              Question_Type: "mcq",
              Subject: "java",
              Question: "In OOP, what is used to create objects?",
              Options: {
                A: "Methods",
                B: "Objects",
                C: "Classes",
                D: "Constructors",
              },
              Score: 1,
              Difficulty: "Easy",
              Tags: "day-1:1",
              Text_Explanation: "Classes act as blueprints to create objects.",
              questionId: "67a0632d6c4050efda546d63",
            },
            {
              Question_Type: "mcq",
              Subject: "java",
              Question:
                "Which version control model uses distributed repositories instead of a centralized server?",
              Options: {
                A: "SVN",
                B: "Git",
                C: "Perforce",
                D: "TFS",
              },
              Score: 1,
              Difficulty: "Medium",
              Tags: "day-1:2",
              Text_Explanation:
                "Git uses distributed version control where every developer has a local repository.",
              questionId: "67a9d797c0ea550573fd9c28",
            },
            {
              Question_Type: "mcq",
              Subject: "java",
              Question:
                "What does 'feature freeze' mean in software development?",
              Options: {
                A: "Locking new features before release",
                B: "Finalizing all UI changes",
                C: "Delaying updates indefinitely",
                D: "Skipping minor updates",
              },
              Score: 1,
              Difficulty: "Hard",
              Tags: "day-1:2",
              Text_Explanation:
                "LTS (Long-Term Support) releases provide stability and security updates for extended periods.",
              questionId: "67a9d797c0ea550573fd9c2e",
            },
          ],
          Coding: [
            {
              Question_No: 20,
              Question_Type: "code",
              Subject: "java",
              Question:
                "Implement a class-based approach to check whether a given number is an Armstrong number.",
              Sample_Input: 153,
              Sample_Output: "Yes",
              Constraints: "1 <= num <= 100000",
              Hidden_Test_Cases: [
                {
                  Input: 371,
                  Output: "Yes",
                },
                {
                  Input: 9474,
                  Output: "Yes",
                },
              ],
              Score: 1,
              Tags: "day-1:1",
              Difficulty: "Easy",
              Text_Explanation: "Class-based Armstrong number check.",
              questionId: "67a081186c4050efda546f4b",
            },
            {
              Question_No: 38,
              Question_Type: "code",
              Subject: "java",
              Question:
                "Use OOP to create a class that computes the sum of squares of the first N numbers.",
              Sample_Input: 10,
              Sample_Output: 30,
              Constraints: "1 <= N <= 1000",
              Hidden_Test_Cases: [
                {
                  Input: 10,
                  Output: 385,
                },
                {
                  Input: 12,
                  Output: 505,
                },
              ],
              Score: 1,
              Tags: "day-1:2",
              Difficulty: "Medium",
              Text_Explanation: "Class-based sum of squares.",
              questionId: "67a081196c4050efda546f5d",
            },
            {
              Question_No: 130,
              Question_Type: "code",
              Subject: "java",
              Question:
                "Implement a class-based approach to check if a number is an Achilles number.",
              Sample_Input: 18,
              Sample_Output: false,
              Constraints: "1 <= N <= 100000",
              Hidden_Test_Cases: [
                {
                  Input: 43,
                  Output: true,
                },
                {
                  Input: 62,
                  Output: false,
                },
              ],
              Score: 1,
              Tags: "day-1:2",
              Difficulty: "Hard",
              Text_Explanation:
                "Class-based approach for Achilles number validation.",
              questionId: "67a0811c6c4050efda546fb9",
            },
          ],
          timeConstraints: {
            MCQs: {
              easy: 1,
              medium: 1,
              hard: 1,
              total: 3,
            },
            Coding: {
              easy: 5,
              medium: 10,
              hard: 15,
              total: 30,
            },
            totalTime: 33,
          },
        },
        {
          subject: "frontend",
          MCQs: [
            {
              Question_No: 169,
              Question_Type: "mcq",
              Subject: "frontend",
              Question: "Which heading tag has the largest default font size?",
              Options: {
                A: "<h1>",
                B: "<h2>",
                C: "<h3>",
                D: "<h6>",
              },
              Score: 1,
              Difficulty: "Easy",
              Tags: "day-1:1",
              Text_Explanation:
                "The <h1> tag has the largest default font size.",
              Explanation_URL: "https://www.youtube.com/watch?v=xexYtH5Xwkk",
              questionId: "67a1e99839fec8ef8868f09f",
            },
            {
              Question_No: 135,
              Question_Type: "mcq",
              Subject: "frontend",
              Question: "Which tag is used to insert an abbreviation?",
              Options: {
                A: "<abbr>",
                B: "<acronym>",
                C: "<short>",
                D: "<label>",
              },
              Score: 1,
              Difficulty: "Medium",
              Tags: "day-1:4",
              Text_Explanation:
                "The <abbr> tag is used to define abbreviations, providing extra meaning when hovered.",
              Explanation_URL: "https://www.youtube.com/watch?v=fbP-tQBWqZ8",
              questionId: "67a1e99739fec8ef8868f07d",
            },
            {
              Question_No: 150,
              Question_Type: "mcq",
              Subject: "frontend",
              Question:
                "Which HTML tag is used to define computer code output?",
              Options: {
                A: "<code>",
                B: "<pre>",
                C: "<samp>",
                D: "<output>",
              },
              Score: 1,
              Difficulty: "Hard",
              Tags: "day-1:2",
              Text_Explanation:
                "The <samp> tag is used to display sample output from a computer program.",
              Explanation_URL: "https://www.youtube.com/watch?v=X6qfJ7vExAY",
              questionId: "67a1e99739fec8ef8868f08c",
            },
          ],
          Coding: [],
          timeConstraints: {
            MCQs: {
              easy: 1,
              medium: 1,
              hard: 1,
              total: 3,
            },
            Coding: {
              easy: 0,
              medium: 0,
              hard: 0,
              total: 0,
            },
            totalTime: 3,
          },
        },
      ],
    },
  };
  const [selectedMCQ, setSelectedMCQ] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [mcqIndex, setMcqIndex] = useState(5);
  const [codingIndex, setCodingIndex] = useState(5);
  const [mcqQuestions, setMcqQuestions] = useState([]);
  const [codingQuestions, setCodingQuestions] = useState([]);

  useEffect(() => {
    const extractedMCQs = [];
    const extractedCoding = [];

    examData.exam.subjects.forEach((subject) => {
      if (subject.MCQs && subject.MCQs.length > 0) {
        extractedMCQs.push(...subject.MCQs);
      }
      if (subject.Coding && subject.Coding.length > 0) {
        extractedCoding.push(...subject.Coding);
      }
    });

    setMcqQuestions(extractedMCQs);
    setCodingQuestions(extractedCoding);
  }, []);
  console.log(mcqQuestions, codingQuestions);

  const handlePrevious = () => {
    if (selectedMCQ && mcqIndex > 0) {
      setMcqIndex(mcqIndex - 1);
      console.log(mcqIndex);
    } else if (!selectedMCQ && codingIndex > 0) {
      setCodingIndex(codingIndex - 1);
      console.log(codingIndex);
    }
  };

  const handleNext = () => {
    if (selectedMCQ && mcqIndex < mcqQuestions.length - 1) {
      setMcqIndex(mcqIndex + 1);
      console.log(mcqIndex);
    } else if (!selectedMCQ && codingIndex < codingQuestions.length - 1) {
      setCodingIndex(codingIndex + 1);
      console.log(codingIndex);
    }
  };

  // ✅ Function to mark a question for review
  const handleMarkReview = () => {
    console.log(`Marked Question ${currentQuestion + 1} for Review`);
  };

  // ✅ Function to submit the test
  const handleSubmit = () => {
    console.log("Test Submitted!");
  };

  return (
    <div className="min-h-screen h-full parent bg-[#E1EFFF]">
      <div className="flex flex-row justify-evenly">
        <div className="test-details bg-white w-[54rem] h-[6.5rem] m-4 border-black border-2 rounded-[20px] text-center p-4 text-3xl">
          Daily Test
        </div>
        <div className="student-details bg-white w-[54rem] h-[6.5rem] m-4 border-black border-2 rounded-[20px] text-center p-4 text-3xl">
          Naga Siva Sai Teja
        </div>
      </div>

      <div className="flex flex-row justify-evenly">
        <div className="section-switching flex flex-row justify-evenly items-center bg-white w-[54rem] h-[6.5rem] m-4 border-black border-2 rounded-[20px] text-center p-4">
          <button
            onClick={() => setSelectedMCQ(true)}
            className={`${
              selectedMCQ
                ? "text-white bg-[#122CD8] hover:bg-[#3f53d4]"
                : "text-black bg-white hover:bg-gray-50 border-black border-[1px]"
            } rounded-[14px] w-[411px] h-[83px] text-2xl`}
          >
            MCQ Section
          </button>
          <button
            onClick={() => setSelectedMCQ(false)}
            className={`${
              selectedMCQ
                ? "text-black bg-white hover:bg-gray-50 border-black border-[1px]"
                : "text-white bg-[#122CD8] hover:bg-[#3f53d4]"
            } rounded-[14px] w-[411px] h-[83px] text-2xl`}
          >
            Coding Section
          </button>
        </div>
        <CountdownTimer
          startTime={examData.exam.startTime}
          totalExamTime={examData.exam.totalExamTime}
        />
      </div>

      {/* QNavigation Component */}
      <QNavigation
        handlePrevious={handlePrevious}
        handleNext={handleNext}
        handleMarkReview={handleMarkReview}
        handleSubmit={handleSubmit}
      />

      <ExamLegend />
    </div>
  );
};
