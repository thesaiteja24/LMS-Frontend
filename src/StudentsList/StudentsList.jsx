import React, {  useState,useEffect} from 'react';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import { write, utils } from 'xlsx';
import { useStudentsData } from '../contexts/StudentsListContext';
import { saveAs } from 'file-saver';

export default function StudentsList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const { studentsList, loading, error,fetchStudentsData } = useStudentsData();
  const { book_new, book_append_sheet, json_to_sheet } = utils;

  
    useEffect(() => {
      fetchStudentsData();
    }, [fetchStudentsData]);

  const studentsPerPage = 20;

  const handleChange = (event, value) => {
    setPage(value);
  };


  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setPage(1);
  };

  const exportToExcel = () => {
    const wb = book_new();
    const studentsWithoutPassword = studentsList.map(({ password, ...rest }) => rest);
    const ws = json_to_sheet(studentsWithoutPassword);
    book_append_sheet(wb, ws, 'Students');
    const excelBuffer = write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, 'students-list.xlsx');
  };

  const filteredStudents = (studentsList || []).filter(student => {
    const studentName = student?.name || "";
    const studentId = student?.studentId || "";
    const batchNo = student?.BatchNo || "";
    const location = student?.location || "";
    return studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
           batchNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
           location.toLowerCase().includes(searchQuery.toLowerCase()) ||
           studentId.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const indexOfLastStudent = page * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstStudent, indexOfLastStudent);
  const totalStudents = filteredStudents.length;
  const totalPages = Math.ceil(totalStudents / studentsPerPage);

  return (
    <div className="bg-blue-100 min-h-screen flex flex-col  mx-auto p-6">
      <h2 className="text-blue-800 text-2xl font-bold text-center mb-4">Students List ({studentsList.length})</h2>
      <div className="flex flex-col items-center space-y-4 mb-4">
        <button
          className="bg-pink-600 hover:bg-pink-500 text-white font-semibold px-4 py-2 rounded"
          onClick={exportToExcel}
        >
          Download Excel
        </button>
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search by studentId, name, batchId, or location"
          className="border border-gray-300 rounded w-1/2 p-2 focus:outline-none focus:ring focus:ring-blue-400"
        />
      </div>

      {loading ? (
        <p className="text-center text-gray-600">Loading...</p>
      ) : error ? (
        <p className="text-center text-red-500">Error loading students. Please try again.</p>
      ) : (
        totalStudents > 0 ? (
          <div className="overflow-x-auto w-full mb-4">
            <table className="w-full border-collapse">
              <thead className="bg-blue-800 text-white">
                <tr>
                  <th className="px-4 py-2">StudentId</th>
                  <th className="px-4 py-2">BatchNO</th>
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Email</th>
                  <th className="px-4 py-2">Phone</th>
                  <th className="px-4 py-2">Location</th>
                  <th className="px-4 py-2">College Name</th>
                  <th className="px-4 py-2">Department</th>
                  <th className="px-4 py-2">Graduation Percentage</th>
                  <th className="px-4 py-2">Skills</th>
                  <th className="px-4 py-2">Year of Passing</th>
                </tr>
              </thead>
              <tbody>
                {currentStudents.map(student => (
                  <tr key={student.id} className="bg-white odd:bg-gray-100">
                    <td className="px-4 py-2 text-center">{student.studentId || '__'}</td>
                    <td className="px-4 py-2 text-center">{student.BatchNo || '__'}</td>
                    <td className="px-4 py-2 text-center">{student.name || '__'}</td>
                    <td className="px-4 py-2 text-center">{student.email || '__'}</td>
                    <td className="px-4 py-2 text-center">{student.phone || '__'}</td>
                    <td className="px-4 py-2 text-center">{student.location || '__'}</td>
                    <td className="px-4 py-2 text-center">{student.collegeName || '__'}</td>
                    <td className="px-4 py-2 text-center">{student.department || '__'}</td>
                    <td className="px-4 py-2 text-center">{student.highestGraduationpercentage ? `${student.highestGraduationpercentage}%` : '__'}</td>
                    <td className="px-4 py-2 text-center">{student.studentSkills?.length > 0 ? student.studentSkills.join(', ') : 'No skills listed'}</td>
                    <td className="px-4 py-2 text-center">{student.yearOfPassing || '__'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-center mt-4">
              <Stack spacing={2}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={handleChange}
                  variant="outlined"
                  shape="rounded"
                />
              </Stack>
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-600">No students found.</p>
        )
      )}
    </div>
  );
}


