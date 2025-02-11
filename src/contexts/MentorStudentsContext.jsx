import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';

const MentorStudentsContext = createContext();

export const useStudentsMentorData = () => useContext(MentorStudentsContext);

export const StudentsMentorProvider = ({ children }) => {
  const [studentsList, setStudentsList] = useState([]);
  const [mentorData, setMentorData] = useState([]);
  const [scheduleData, setScheduleData] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
   const [location, setLocation] = useState(localStorage.getItem("location"));

   useEffect(() => {
    const storedLocation = localStorage.getItem("location");
    if (storedLocation) {
      setLocation(storedLocation);
    }
  }, []);

  const fetchMentorStudents = useCallback(async (selectedBatch) => {
    setLoading(true);
    setError(null);

    try {
      const  mentorId= localStorage.getItem('Mentors');

      if (!mentorId) {
        throw new Error('Mentor ID is missing in local storage.');
      }

      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/v1/mentorstds`,
        { params: { location, mentorId: mentorId,batch:selectedBatch } }
      );


      setMentorData(response.data.mentor_data[0] || {});
      setScheduleData(response.data.schedule_data || []);
      setStudentsList(response.data.student_data || []);
      setClasses(response.data.classes || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch data from the server.');
    } finally {
      setLoading(false);
    }
  }, [location]);

  // useEffect(() => {
  //   fetchMentorStudents();
  // }, [fetchMentorStudents]);

  const contextValue = useMemo(
    () => ({
      mentorData,
      scheduleData,
      classes,
      studentsList,
      loading,
      error,
      fetchMentorStudents,
    }),
    [mentorData, scheduleData, studentsList, loading, error, fetchMentorStudents, classes]
  );

  return (
    <MentorStudentsContext.Provider value={contextValue}>
      {children}
    </MentorStudentsContext.Provider>
  );
};
