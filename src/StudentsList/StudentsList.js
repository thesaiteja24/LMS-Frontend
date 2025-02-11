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




// import React, { useState } from 'react';
// import Pagination from '@mui/material/Pagination';
// import Stack from '@mui/material/Stack';
// import './StudentsList.css';
// import { write, utils } from 'xlsx';
// import { useStudentsData } from '../contexts/StudentsListContext';
// import { saveAs } from 'file-saver';

// export default function StudentsList() {
//   const [searchQuery, setSearchQuery] = useState('');
//   const [page, setPage] = useState(1);
//   const { studentsList, loading, error } = useStudentsData();
//   const { book_new, book_append_sheet, json_to_sheet } = utils;
//    console.log(studentsList)
  

//   const studentsPerPage = 20;

//   const handleChange = (event, value) => {
//     setPage(value);
//   };

//   const handleSearchChange = (event) => {
//     setSearchQuery(event.target.value);
//     setPage(1); 
//   };

//   const exportToExcel = () => {
//     const wb = book_new(); 
//     const studentsWithoutPassword = studentsList.map(({ password, ...rest }) => rest);
//     const ws = json_to_sheet(studentsWithoutPassword); 
//     book_append_sheet(wb, ws, 'Students'); 
//     const excelBuffer = write(wb, { bookType: 'xlsx', type: 'array' });
//     const blob = new Blob([excelBuffer], { type: 'application/octet-stream' }); 
//     saveAs(blob, 'students-list.xlsx'); 
//   };
  

//   const filteredStudents = (studentsList || []).length > 0
//   ? studentsList.filter(student => {
//       const studentName = student?.name || ""; 
//       const studentId = student?.studentId || "";
//       const batchNo = student?.BatchNo || "";
//       const location = student?.location || "";
//       return studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
//              batchNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
//              location.toLowerCase().includes(searchQuery.toLowerCase()) ||
//              studentId.toLowerCase().includes(searchQuery.toLowerCase());
//     })
//   : [];



//   const indexOfLastStudent = page * studentsPerPage;
//   const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
//   const currentStudents = filteredStudents.slice(indexOfFirstStudent, indexOfLastStudent);
//   const totalStudents = filteredStudents.length;
//   const totalPages = Math.ceil(totalStudents / studentsPerPage);

//   return (
//     <div className='studentslist-dashboard' style={{ marginBottom: "-10px" }}>
     
//       <h2 className='success'>Students List ({studentsList.length})</h2>
//       <div className='download-container'>
//         <button className='download-button excel' onClick={exportToExcel}>Download Excel</button>
//         <input
//           type="text"
//           value={searchQuery}
//           onChange={handleSearchChange}
//           placeholder="Search by studentId or name or batchId or location"
//           className='studentslist-search-bar'
//         />
//       </div>
//       <br />
//       {loading ? (
//         <p className='loading-message'>Loading...</p>
//       ) : error ? (
//         <p className='error-message'>Error loading students. Please try again.</p>
//       ) : (
//         totalStudents > 0 ? (
//           <div className='table-container'>
//             <table>
//               <thead>
//                 <tr>
//                   <th>StudentId</th>
//                   <th>BatchNO</th>
//                   <th>Name</th>
//                   <th>Email</th>
//                   <th>Phone</th>
//                   <th>Location</th>
//                   <th>College Name</th>
//                   <th>Department</th>
//                   <th>Graduation Percentage</th>
//                   <th>Skills</th>
//                   <th>Year of <br /> Passing</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {currentStudents.length > 0 ? (
//                   currentStudents.map(student => (
//                     <tr key={student.id} className='studentslist-item'>
//                       <td>{student.studentId || '__'}</td>
//                       <td>{student.BatchNo || '__'}</td>
//                       <td>{student.name || '__'}</td>
//                       <td>{student.email || '__'}</td>
//                       <td>{student.phone || '__'}</td>
//                       <td>{student.location||'__'}</td>
//                       <td>{student.collegeName || '__'}</td>
//                       <td>{student.department || '__'}</td>
//                       <td>{student.highestGraduationpercentage 
//                       ? `${student.highestGraduationpercentage}%` 
//                       : '__'}</td>
//                       <td>{student.studentSkills?.length > 0 ? student.studentSkills.join(', ') : 'No skills listed'}</td>
//                       <td>{student.yearOfPassing || '__'}</td>
//                     </tr>
//                   ))
//                 ) : (
//                   <tr>
//                     <td colSpan="8">No students found</td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//             <div className='pagination'>
//               <Stack spacing={2}>
//                 <Pagination
//                   count={totalPages}
//                   page={page}
//                   onChange={handleChange}
//                   variant="outlined"
//                   shape="rounded"
//                 />
//               </Stack>
//             </div>
//           </div>
//         ) : (
//           <p className='no-results'>No students found.</p>
//         )
//       )}
//     </div>
//   );
// }
// .studentslist-dashboard {
//   background-color: #e1e7ff !important;
//   display: flex;
//   flex-direction: column;
//   justify-content: center;
//   margin: auto;
//   padding: 2% 10px;
// }

// .success {
//   color: #32398d;
//   margin: auto;
//   font-size: 30px;
//   font-weight: bold;
//   text-align: center;

// }

// .studentslist-search-bar {
//   border: none;
//   border-radius: 2px;
//   color: #000;
//   margin: 1.8% auto;
//   padding: 10px;
//   width: 40%;
// }

// .table-container {
//   overflow-x: auto; /* Enables horizontal scrolling */
//   width: 100%;
//   padding-bottom: 9px;
// }

// .table-container table {
//   width: 100%;
//   border-collapse: collapse;
// }

// .table-container td,
// .table-container th {
//   background-color: #e1e7ff !important;
//   padding: 8px 15px;
//   color: black;
//   border: 1px solid rgba(52, 64, 154, 0.4); /* Light border for structure */
//   text-align: center;
// }

// .table-container th {
//   color: white;
//   background-color: #32398d !important;
//   border-radius: 5px 5px 0 0;
// }

// .loading-message,
// .no-results {
//   font-size: 16px;
//   color: #000; /* Black color for messages */
//   text-align: center;
//   margin-top: 20px;
// }

// .studentslist-search-bar {
//   width: 40%;
//   margin: 1.8% auto;
//   border: 1px solid #ccc;
//   border-radius: 5px;
//   padding: 10px;
//   color: black;
//   transition: all 0.3s ease;
// }

// .studentslist-search-bar:focus {
//   border-color: #32398d;
//   outline: none;
// }

// .download-container {
//   display: flex;
//   justify-content: center;
//   margin: 10px 0;
//   flex-wrap: wrap;
//   flex-direction: column;
//   align-items: center;
// }

// .download-button {
//   border: none;
//   outline: none;
//   border-radius: 5px;
//   cursor: pointer;
//   font-weight: 600;
//   font-size: 14px;
//   padding: 10px 15px;
//   color: #ffffff;
// }

// .excel {
//   background-color: rgb(204, 51, 102);
// }

// .excel:hover {
//   background-color: rgb(184, 41, 92);
// }

// .pagination {
//   display: flex;
//   justify-content: center;
//   margin-top: 20px;
// }


// @media (max-width: 1200px) {
//   .studentslist-dashboard {
//     padding: 2% 0%;
//   }

 

//   .download-button {
//     font-size: 12px;
//     padding: 8px 10px;
//   }

//   .table-container td,
//   .table-container th {
//     padding: 10px 12px;
//   }

//   .table-container {
//     overflow-x: auto; /* Add horizontal scrolling for tables */
//     display: block;
//   }

//   .table-container table {
//     width: 1100px; /* Set a fixed width for the table */
//   }
// }

// /* Responsive Design for Small Devices */
// @media (max-width: 700px) {
//   .studentslist-dashboard {
//     padding: 2% 0%;
//   }


//   .download-button {
//     font-size: 12px;
//     padding: 8px 10px;
//   }

//   .table-container td,
//   .table-container th {
//     padding: 10px 12px;
//   }

//   .table-container {
//     overflow-x: auto; /* Add horizontal scrolling for tables */
//     display: block;
//   }

//   .table-container table {
//     width: 900px; /* Set a fixed width for the table */
//   }
// }

// /* Mobile-specific Scrolling Behavior (Max-width: 480px) */
// @media (max-width: 480px) {
//   .studentslist-dashboard {
//     padding: 5% 0;
//   }

//   .studentslist-search-bar {
//     width: 90%;
//     padding: 8px;
//   }

//   .download-button {
//     font-size: 10px;
//     padding: 5px 8px;
//   }

//   .table-container {
//     overflow-x: scroll; /* Allow horizontal scrolling */
//     display: block;
//     -webkit-overflow-scrolling: touch; /* Smooth scrolling on iOS */
//   }

//   .table-container table {
//     min-width: 1100px; /* Ensure a minimum width for horizontal scrolling */
//   }

//   .table-container tr {
//     display: table-row; /* Retain table-row structure for scrolling */
//     border: none;
//   }

//   .table-container td {
//     display: table-cell;
//     padding: 10px;
//   }

//   .success {
//     font-size: 24px;
//     text-align: center;
//   }

//   .download-container {
//     flex-direction: column;
//     gap: 10px;
//   }

  

  
// }



