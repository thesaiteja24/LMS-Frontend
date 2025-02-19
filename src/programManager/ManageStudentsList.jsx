import React, { useEffect, useState } from 'react';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import '../StudentsList/StudentsList.css';
import { write, utils } from 'xlsx';
import { useStudentsManageData } from '../contexts/ManagerStudentsContext';
import { saveAs } from 'file-saver';

export default function StudentsList() {
  const [page, setPage] = useState(1);
  const { studentsList, loading, error, fetchManageStudents } = useStudentsManageData();
  const { book_new, book_append_sheet, json_to_sheet } = utils;
  const location = localStorage.getItem('location');

  // **Filters**
  const [searchStudentId, setSearchStudentId] = useState('');
  const [searchBatchNo, setSearchBatchNo] = useState('');
  const [searchDepartment, setSearchDepartment] = useState('');
  const [searchHighestGraduation, setSearchHighestGraduation] = useState('');
  const [minPercentage, setMinPercentage] = useState(''); // Minimum Graduation Percentage
  const [searchYop, setSearchYop] = useState('');
  const [searchBacklogs, setSearchBacklogs] = useState('');

  useEffect(() => {
    fetchManageStudents(location);
  }, [fetchManageStudents, location]);

  const studentsPerPage = 20;

  const handleChange = (event, value) => {
    setPage(value);
  };

  const exportToExcel = () => {
    const wb = book_new();
    const filteredData = filteredStudents.map(({ password, ...rest }) => rest); // Remove passwords if any
    const ws = json_to_sheet(filteredData);
    book_append_sheet(wb, ws, 'Filtered Students');
    const excelBuffer = write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, 'filtered-students-list.xlsx');
  };

  // **Filtering Logic**
  const filteredStudents = (studentsList || []).filter(student => {
    const studentPercentage = student?.highestGraduationpercentage || 0;

    // **Convert comma-separated input to array**
    const enteredDepartments = searchDepartment
      ? searchDepartment.split(',').map(dept => dept.trim().toLowerCase())
      : [];

    // **Check if any entered department matches the student's department**
    const departmentMatch =
      searchDepartment === '' ||
      enteredDepartments.some(dept => (student?.department || '').toLowerCase().includes(dept));

    return (
      (searchStudentId === '' || (student?.studentId || '').toLowerCase().includes(searchStudentId.toLowerCase())) &&
      (searchBatchNo === '' || (student?.BatchNo || '').toLowerCase().includes(searchBatchNo.toLowerCase())) &&
      departmentMatch && // **Updated department filtering**
      (searchHighestGraduation === '' || (student?.qualification || '').toLowerCase().includes(searchHighestGraduation.toLowerCase())) &&
      (minPercentage === '' || studentPercentage >= parseFloat(minPercentage)) &&
      (searchYop === '' || (student?.yearOfPassing || '').toString().includes(searchYop)) &&
      (searchBacklogs === '' || (student?.ArrearsCount || '').toString().includes(searchBacklogs))
    );
  });

  const indexOfLastStudent = page * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstStudent, indexOfLastStudent);
  const totalStudents = filteredStudents.length;
  const totalPages = Math.ceil(totalStudents / studentsPerPage);

  return (
    <div className="bg-blue-100 min-h-screen flex flex-col mx-auto p-6">
      <h2 className="text-blue-800 text-2xl font-bold text-center mb-4">
        Students List ({studentsList.length})
      </h2>
      <div className="flex flex-col items-center space-y-4 mb-4">
        <button
          className="bg-pink-600 hover:bg-pink-500 text-white font-semibold px-4 py-2 rounded"
          onClick={exportToExcel}
        >
          Download Excel
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-4 p-4 bg-white shadow-md rounded-md">
        <input
          type="text"
          value={searchStudentId}
          onChange={(e) => setSearchStudentId(e.target.value)}
          placeholder="Filter by Student ID"
          className="border border-gray-300 rounded p-2 focus:outline-none focus:ring focus:ring-blue-400"
        />
        <input
          type="text"
          value={searchBatchNo}
          onChange={(e) => setSearchBatchNo(e.target.value)}
          placeholder="Filter by Batch No"
          className="border border-gray-300 rounded p-2 focus:outline-none focus:ring focus:ring-blue-400"
        />
        <input
          type="text"
          value={searchDepartment}
          onChange={(e) => setSearchDepartment(e.target.value)}
          placeholder="Filter by Department (Comma separated)"
          className="border border-gray-300 rounded p-2 focus:outline-none focus:ring focus:ring-blue-400"
        />
        <input
          type="text"
          value={searchHighestGraduation}
          onChange={(e) => setSearchHighestGraduation(e.target.value)}
          placeholder="Filter by Highest Graduation"
          className="border border-gray-300 rounded p-2 focus:outline-none focus:ring focus:ring-blue-400"
        />
        <input
          type="number"
          value={minPercentage}
          onChange={(e) => setMinPercentage(e.target.value)}
          placeholder="Minimum Graduation %"
          className="border border-gray-300 rounded p-2 focus:outline-none focus:ring focus:ring-blue-400"
        />
        <input
          type="text"
          value={searchYop}
          onChange={(e) => setSearchYop(e.target.value)}
          placeholder="Filter by YOP"
          className="border border-gray-300 rounded p-2 focus:outline-none focus:ring focus:ring-blue-400"
        />
        <input
          type="text"
          value={searchBacklogs}
          onChange={(e) => setSearchBacklogs(e.target.value)}
          placeholder="Filter by Backlogs"
          className="border border-gray-300 rounded p-2 focus:outline-none focus:ring focus:ring-blue-400"
        />
      </div>

      {loading ? (
        <p className="text-center text-gray-600">Loading...</p>
      ) : error ? (
        <p className="text-center text-red-500">Error loading students. Please try again.</p>
      ) : totalStudents > 0 ? (
        <div className="overflow-x-auto w-full mb-4">
          <table className="w-full border-collapse">
            <thead className="bg-blue-800 text-white">
              <tr>
                <th className="px-4 py-2">StudentId</th>
                <th className="px-4 py-2">Student Name</th>
                <th className="px-4 py-2">BatchNO</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Phone</th>
                <th className="px-4 py-2">College Name</th>
                <th className="px-4 py-2">Highest Graduation</th>
                <th className="px-4 py-2">Department</th>
                <th className="px-4 py-2">Graduation Percentage</th>
                <th className="px-4 py-2">Graduation Passout Year</th>
                <th className="px-4 py-2">Backlogs</th>
              </tr>
            </thead>
            <tbody>
              {currentStudents.map(student => (
                <tr key={student.id} className="bg-white odd:bg-gray-100">
                  <td className="px-4 py-2 text-center">{student.studentId || '__'}</td>
                  <td className="px-4 py-2 text-center">{student.name || '__'}</td>
                  <td className="px-4 py-2 text-center">{student.BatchNo || '__'}</td>
                  <td className="px-4 py-2 text-center">{student.email || '__'}</td>
                  <td className="px-4 py-2 text-center">{student.studentPhNumber || '__'}</td>
                  <td className="px-4 py-2 text-center">{student.collegeName || '__'}</td>
                  <td className="px-4 py-2 text-center">{student.qualification || '__'}</td>
                  <td className="px-4 py-2 text-center">{student.department || '__'}</td>
                  <td className="px-4 py-2 text-center">{student.highestGraduationpercentage ? `${student.highestGraduationpercentage}%` : '__'}</td>
                  <td className="px-4 py-2 text-center">{student.yearOfPassing || '__'}</td>
                  <td className="px-4 py-2 text-center">{student.ArrearsCount || '__'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-center text-gray-600">No students found.</p>
      )}
    </div>
  );
}
