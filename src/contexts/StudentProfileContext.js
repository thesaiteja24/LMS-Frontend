import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axiosInstance from '../axiosInstance';
import { useNavigate } from 'react-router-dom';

const StudentProfileContext = createContext();

export const useStudent = () => useContext(StudentProfileContext);

export const StudentProvider = ({ children }) => {
  
  const [studentDetails, setStudentDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  const fetchStudentDetails = useCallback(async () => {
    const student_id = localStorage.getItem("student_login_details");
    const location = localStorage.getItem("location");

    if (!student_id) {
      setError("Student ID not found in local storage.");
      setLoading(false);
      return;
    }

    try {
      const response = await axiosInstance.get(`/api/v1/getstudentdetails`, {
        params: { student_id, location },
      });

      setStudentDetails(response.data || { studentSkills: [] });
      setError(null);
    } catch (error) {
      console.error("Error fetching student details:", error);

      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.clear(); // Clear all user data
        navigate("/login"); // Redirect to login
      } else {
        setError("Failed to load student details. Please try again.");
      }

      setStudentDetails({ studentSkills: [] });
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchStudentDetails();
  }, [fetchStudentDetails]);

  if (loading) return <div>Loading student details...</div>;

  return (
    <StudentProfileContext.Provider
      value={{
        studentDetails,
        setStudentDetails,
        loading,
        error,
        fetchStudentDetails,
      }}
    >
      {children}
    </StudentProfileContext.Provider>
  );
};
