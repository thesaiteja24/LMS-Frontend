import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useStudent } from "../contexts/StudentProfileContext";

const SubjectMappings = {
  PFS: ["Python", "Flask", "Frontend", "SoftSkills", "MySQL", "Aptitude"],
  JFS: ["Java", "AdvancedJava", "Frontend", "SoftSkills", "MySQL", "Aptitude"],
  DA: ["Python", "MySQL", "SoftSkills", "Aptitude"],
  DS: ["Python", "SoftSkills", "MySQL", "Aptitude"],
};

const Subjects = [
  { name: "Python", description: "Learn Python programming from basics to advanced.", image: "/python.jpg" },
  { name: "Java", description: "Master Java programming concepts with practical examples.", image: "/java.jpg" },
  { name: "AdvancedJava", description: "Deep dive into advanced Java programming concepts.", image: "/advancejava.jpg" },
  { name: "Frontend", description: "Build dynamic and responsive UI using modern frontend technologies.", image: "/frontend.jpg" },
  { name: "MySQL", description: "Learn database management and SQL queries with MySQL.", image: "/mysql.jpg" },
  { name: "Flask", description: "Master web development using the Flask framework in Python.", image: "/flask.jpg" },
  { name: "SoftSkills", description: "Enhance your communication and teamwork skills.", image: "/softskills.jpg" },
  { name: "Aptitude", description: "Sharpen your logical reasoning and problem-solving skills.", image: "/aptitude.webp" },
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
    <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen p-8">
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold text-center text-indigo-700 mb-8">Explore Your Curriculum</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredSubjects.map((subject, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-transform transform hover:scale-105 cursor-pointer overflow-hidden border border-gray-200"
              onClick={() => handleSubjectClick(subject)}
            >
              <img
                src={subject.image}
                alt={subject.name}
                className="w-full h-40 object-cover"
              />
              <div className="p-4">
                <h2 className="text-lg font-semibold text-gray-800 truncate">{subject.name}</h2>
                <p className="text-gray-600 text-sm mt-2 line-clamp-3">{subject.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentCurriculum;
