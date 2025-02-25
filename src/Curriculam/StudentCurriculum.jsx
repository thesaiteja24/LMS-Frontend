import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useStudent } from "../contexts/StudentProfileContext";
import { FaStar } from "react-icons/fa";

const SubjectMappings = {
  PFS: ["Python", "Flask", "Frontend", "SoftSkills", "MySQL", "Aptitude"],
  JFS: ["Java", "AdvancedJava", "Frontend", "SoftSkills", "MySQL", "Aptitude"],
  DA: ["Python", "MySQL", "SoftSkills", "Aptitude"],
  DS: ["Python", "SoftSkills", "MySQL", "Aptitude"],
};

const Subjects = [
  { name: "Python", description: "Learn Python programming from basics to advanced.", image: "/python.jpg" },
  { name: "Java", description: "Master Java programming concepts with practical examples.", image: "/java.png" },
  { name: "AdvancedJava", description: "Deep dive into advanced Java programming concepts.", image: "/advancejava.jpg" },
  { name: "Frontend", description: "Build dynamic and responsive UI using modern frontend technologies.", image: "/frontend.jpg" },
  { name: "MySQL", description: "Learn database management and SQL queries with MySQL.", image: "/mysql.jpg" },
  { name: "Flask", description: "Master web development using the Flask framework in Python.", image: "/flask.jpg" },
  { name: "SoftSkills", description: "Enhance your communication and teamwork skills.", image: "/softskills.jpg" },
  { name: "Aptitude", description: "Sharpen your logical reasoning and problem-solving skills.", image: "/Aptitude.png" },
  { name: "Data Science", description: "Explore data science concepts and tools to derive insights.", image: "/datascience.jpg" },
  { name: "Data Analytics", description: "Learn how to analyze data and make data-driven decisions.", image: "/dataanalytics.jpg" },
];

const StudentCurriculum = () => {
  const { studentDetails } = useStudent();
  const navigate = useNavigate();
  const [filteredSubjects, setFilteredSubjects] = useState([]);

  useEffect(() => {
    if (studentDetails?.BatchNo) {
      const batchPrefix = studentDetails.BatchNo.split("-")[0];
      const subjectsForBatch = SubjectMappings[batchPrefix] || [];
      const filtered = Subjects.filter(subject => subjectsForBatch.includes(subject.name));
      setFilteredSubjects(filtered);
    }
  }, [studentDetails]);

  const handleSubjectClick = (subject) => {
    navigate(`/subject/${subject.name.toLowerCase().replace(/ /g, "-")}`, { state: { subject } });
  };

  return (
    <div className="bg-[#f4f4f4] flex flex-col items-center p-1 ">
      <div>
        <h1 className="text-5xl font-bold text-center">Student Curriculum</h1>
        <p className="text-2xl text-center">Explore your learning modules and resources</p>
      </div>
      <div className="bg-[#19216f] rounded-lg p-3 lg:p-20 lg:pb-10 md:p-10 .env py-20 w-full max-w-[100%]  mt-4 pt-15">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4  md:grid-cols-3 gap-y-20 gap-10"> {/* Increased gap from 6 to 8 */}
          {filteredSubjects.map((subject, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-lg p-6 relative space-y-6 cursor-pointer transition-transform transform hover:scale-105"
              onClick={() => handleSubjectClick(subject)}
            >
              <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 ">
                <img
                  alt={`${subject.name} logo`}
                  className="w-24 h-24 rounded-full " 
                  src={subject.image}
                />
              </div>
              <div className="mt-12 text-center space-y-4">
                <div className="flex justify-center mb-2 space-x-1 m-10">
                  {[...Array(5)].map((_, index) => (
                    <FaStar key={index} className="text-yellow-500" />
                  ))}
                </div>
                <h2 className="text-xl font-bold text-gray-800">{subject.name}</h2>
                <button className="mt-4  bg-[#19216f] text-white py-2 px-4 rounded-md shadow-md hover:bg-blue-700 w-full">
                  Know More....
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentCurriculum;