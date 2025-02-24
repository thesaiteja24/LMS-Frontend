import React, { useState,useEffect} from "react";
// import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2/dist/sweetalert2.min.js";
import axios from "axios";
import { useStudentsData } from "../../contexts/StudentsListContext";
import { useUniqueBatches } from '../../contexts/UniqueBatchesContext';
import { read, utils } from "xlsx";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import Select from "react-select";


import {
  FaUpload,
  FaFileExcel,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaUsers,
  FaCalendarAlt,
   FaWhatsapp ,
  FaDownload,
  FaBookOpen,
} from "react-icons/fa"; 

export default function ProgramManagerSignup() {
  // const navigate = useNavigate();
  const { fetchStudentsData } = useStudentsData();
    const { batches,fetchBatches } = useUniqueBatches();
    const emailRegex = /^(?!.*\.\.)[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  const [formData, setFormData] = useState({
    studentId: "",
    batchNo: "",
    email: "",
    studentPhNumber: "",
    parentNumber: "",
    modeOfStudy:'Offline'
  });

  const [studentCountryCode, setStudentCountryCode] = useState(null);
  const [parentCountryCode, setParentCountryCode] = useState(null);
  const [countryCodes, setCountryCodes] = useState([]);

  // 🔹 Fetch Country Codes from API
  useEffect(() => {
    axios.get("https://restcountries.com/v3.1/all")
      .then((response) => {
        const countryList = response.data
        .map(country => ({
          value: `${country.idd.root}${country.idd.suffixes?.[0] || ""}`,
          label: `${country.idd.root}${country.idd.suffixes?.[0] || ""}`
        }))
          .filter(country => country.value !== "undefined"); // Ensure valid country codes

        setCountryCodes(countryList);
        setStudentCountryCode(countryList.find(c => c.value === "+91")); // Default: India
        setParentCountryCode(countryList.find(c => c.value === "+91")); // Default: India
      })
      .catch(error => console.error("Error fetching country codes:", error));
  }, []);



  const [excelData, setExcelData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [useExcel, setUseExcel] = useState(false);
  const location = localStorage.getItem('location');
  const phoneRegex = /^[9876]\d{9}$/;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  

    useEffect(() => {
      fetchBatches(location);
    }, [fetchBatches,location]);

    const handleFileUpload = (e) => {
      const file = e.target.files[0];
      if (!file) return;
  
      const fileExtension = file.name.split(".").pop().toLowerCase();
      const reader = new FileReader();
  
      reader.onload = (event) => {
          const content = event.target.result;
  
          if (["xlsx", "xls"].includes(fileExtension)) {
              const data = new Uint8Array(content);
              const workbook = read(data, { type: "array" });
              const sheetName = workbook.SheetNames[0];
              const sheet = workbook.Sheets[sheetName];
              const rows = utils.sheet_to_json(sheet, { header: 1 });
  
              if (rows.length > 1) {
                  const headers = rows[0].map((header) => header.toLowerCase().trim());
  
                      const formattedData = rows.slice(1).map((row) => {
                      const studentPh = row[headers.indexOf("studentphnumber")]?.toString().trim() || "";
                      const parentPh = row[headers.indexOf("parentnumber")]?.toString().trim() || "";
                      const batchNo = row[headers.indexOf("batchno")]?.toString().toUpperCase() || "";
  
                      return {
                          studentId: row[headers.indexOf("studentid")]?.toString().toUpperCase() || "",
                          batchNo: batchNo,
                          email: row[headers.indexOf("email")]?.toString()?.toLowerCase() || "",
                          studentPhNumber: 
                              studentPh.startsWith("+91") 
                                  ? studentPh 
                                  : (studentPh.length === 10 && /^[6789]\d{9}$/.test(studentPh) ? `+91${studentPh}` : studentPh),
                          parentNumber: 
                              parentPh.startsWith("+91") 
                                  ? parentPh 
                                  : (parentPh.length === 10 && /^[6789]\d{9}$/.test(parentPh) ? `+91${parentPh}` : parentPh),
                          location: row[headers.indexOf("location")]?.toString().toLowerCase() || "",
                          modeOfStudy: row[headers.indexOf("modeofstudy")]?.toString() || "",
                      };
                  });
  
                  // 🔹 Validate batch numbers against fetched batches
                  const validBatchNos = batches.map((batch) => batch.Batch);
                  const invalidEntries = formattedData.filter(entry => !validBatchNos.includes(entry.batchNo));
  
                  if (invalidEntries.length > 0) {
                      Swal.fire({
                          title: "Invalid Batch Numbers Found!",
                          text: `The following batch numbers are invalid: ${invalidEntries.map(e => e.batchNo).join(", ")}`,
                          icon: "error",
                      });
                      return;
                  }

                  const invalidEmails = formattedData.filter(entry => !emailRegex.test(entry.email));
                  if (invalidEmails.length > 0) {
                      Swal.fire({
                          title: "Invalid Email Format!",
                          text: `The following emails are not valid Gmail addresses: ${invalidEmails.map(e => e.email).join(", ")}`,
                          icon: "error",
                      });
                      return;
                  }
  
                  setExcelData(formattedData);
              } else {
                  Swal.fire({
                      title: "Invalid Excel File",
                      text: "The file is empty or missing headers.",
                      icon: "error",
                  });
              }
          } else {
              Swal.fire({
                  title: "Invalid File",
                  text: "Unsupported file type. Please upload Excel files (.xlsx, .xls).",
                  icon: "error",
              });
          }
      };
  
      reader.readAsArrayBuffer(file);
  };
  


  const handleDownloadTemplate = () => {
    const templateData = [
      {
        studentId: "CG112",
        batchNo: "PFS-100",
        email: "example@gmail.com",
        studentPhNumber: "+918688031605",
        parentNumber: "+918688031603",
        modeOfStudy:'Offline',
        location,

      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, "Student_Enrollment_Template.xlsx");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const studentPhone = studentCountryCode?.value + formData.studentPhNumber;
    const parentPhone = parentCountryCode?.value + formData.parentNumber;
    setLoading(true);
  
    try {
      const endpoint = `${import.meta.env.VITE_BACKEND_URL}/api/v1/addstudent`;
      let response;

      
  
      // Validate phone numbers if not using Excel
      if (!useExcel) {
        if (!emailRegex.test(formData.email)) {
          Swal.fire({
              icon: "error",
              title: "Invalid Email!",
              text: "Please enter a valid email address (no consecutive dots, proper format).",
          });
          setLoading(false);
          return;
      }

        if (!phoneRegex.test(formData.studentPhNumber) || !phoneRegex.test(formData.parentNumber)) {
          Swal.fire({
            icon: "error",
            title: "Invalid Phone Number",
            text: "Phone number must start with 9, 8, 7, or 6 and contain exactly 10 digits.",
          });
          setLoading(false);
          return;
        }
  
        response = await axios.post(endpoint, {
          ...formData,
          studentId: formData.studentId.toUpperCase(),
          batchNo: formData.batchNo.toUpperCase(),
          studentPhNumber: studentPhone,
          parentNumber: parentPhone,
          location,
          profileStatus:false
        });
      } else {
        const updatedExcelData = excelData.map((entry) => ({
          ...entry,
          profileStatus: false,  // ✅ Added default profile status
        }));
        response = await axios.post(endpoint, { excelData: updatedExcelData });
      }
  
      if (response.status === 200) {
        Swal.fire({
          title: useExcel ? "Students Enrolled Successfully" : "Student Enrolled Successfully",
          icon: "success",
        });
  
        setExcelData([]); 
        setUseExcel(false); 
  
        const excelUploadElement = document.getElementById("excelUpload");
        if (excelUploadElement) {
          excelUploadElement.value = ""; 
        }
  
        setFormData({
          studentId: "",
          batchNo: "",
          email: "",
          studentPhNumber: "",
          parentNumber: "",
        });
  
        await fetchStudentsData();
      }
    } catch (error) {
  
      if (error.response) {
        const status = error.response.status;
        const errorMessage = error.response.data.message || error.response.data.error || "Something went wrong!";
  
        if (status === 400) {
          Swal.fire({ icon: "error", title: "Bad Request!", text: errorMessage });
        } else if (status === 404) {
          Swal.fire({ icon: "error", title: "Already Exist!", text: errorMessage });
        } else {
          Swal.fire({ icon: "error", title: "Submission Failed!", text: errorMessage });
        }
      } else {
        // 🔹 Handle network errors (server not reachable)
        Swal.fire({
          icon: "error",
          title: "Network Error!",
          text: "Unable to connect to the server. Please try again later.",
        });
      }
    } finally {
      setLoading(false);
      setFormData({
        studentId: "",
        batchNo: "",
        email: "",
        studentPhNumber: "",
        parentNumber: "",
      });
  
      setExcelData([]);
    }
  };
  
  
  return (
    <div className="flex flex-col justify-center items-center min-h-[100vh] bg-[#e1e7ff] p-4">
      
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-xl">
      {useExcel && (
          <div className="flex justify-center gap-4 mb-4 text-center items-center">
            
            <button
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
              onClick={handleDownloadTemplate}
            >
              <FaDownload /> Download Template
            </button>
          </div>
        )}
        <h1 className="text-2xl font-semibold text-center text-gray-800 mb-6">
          Student Enrollment
        </h1>

        <div className="flex justify-center gap-4 mb-6">
          <button
            className={`px-6 py-2 border rounded-md transition duration-300 text-lg font-medium flex items-center gap-2 ${
              !useExcel ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"
            }`}
            onClick={() => setUseExcel(false)}
          >
            <FaUser /> Manual Entry
          </button>
          <button
            className={`px-6 py-2 border rounded-md transition duration-300 text-lg font-medium flex items-center gap-2 
              ${
              useExcel ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"
            }`}
            onClick={() => setUseExcel(true)}
          >
            <FaFileExcel /> Excel Upload
          </button>
        </div>

      

  <form onSubmit={handleSubmit}>
  {!useExcel ? (
    <>
      {/* Student ID */}
      <div className="mb-4">
        <label htmlFor="studentId" className="block text-black font-semibold mb-2">
          Student ID
        </label>
        <div className="flex items-center border border-gray-300 rounded-md p-2">
          <FaUsers className="text-black mr-2" />
          <input
            id="studentId"
            name="studentId"
            type="text"
            placeholder="Enter Student ID"
            value={formData.studentId}
            onChange={handleChange}
            className="flex-1 px-2 py-1 text-gray-800 outline-none font-medium"
            required
          />
        </div>
      </div>

      {/* Batch No (Dropdown) */}
      <div className="mb-4">
  <label htmlFor="batchNo" className="block text-black font-semibold mb-2">
    Batch
  </label>
  <div className="flex items-center border border-gray-300 rounded-md p-2">
    <FaCalendarAlt className="text-black mr-2" />
    <select
      id="batchNo"
      name="batchNo"
      value={formData.batchNo}
      onChange={(e) =>
        setFormData((prev) => ({ ...prev, batchNo: e.target.value }))
      }
      className="w-full px-3 py-2 text-gray-800 font-medium"
      required
    >
      <option value="" disabled>
        Select Batch
      </option>
      {batches.map((batch) => (
        <option key={batch.Batch} value={batch.Batch}>
          {batch.Batch}
        </option>
      ))}
    </select>
  </div>
</div>



      {/* Email */}
      <div className="mb-4">
        <label htmlFor="email" className="block text-black font-semibold mb-2">
          Email
        </label>
        <div className="flex items-center border border-gray-300 rounded-md p-2">
          <FaEnvelope className="text-black mr-2" />
          <input
            id="email"
            name="email"
            type="email"
            placeholder="Enter Email"
            value={formData.email.toLowerCase()}
            onChange={handleChange}
            className="flex-1 px-2 py-1 text-gray-800 outline-none font-medium"
            required
          />
        </div>
      </div>

      <div className="mb-4">
            <label className="block text-black font-semibold mb-2">
              Student Whatsapp Number
            </label>
            <div className="flex items-center border border-gray-300 rounded-md p-2">
            <FaWhatsapp  className="text-green-600 mr-2 text-2xl" />

              <Select
                options={countryCodes}
                value={studentCountryCode}
                onChange={setStudentCountryCode}
                placeholder="Select Code"
                className="mr-2 w-1/5"
              />
              <input
                name="studentPhNumber"
                type="number"
                placeholder="Enter Student Phone Number"
                value={formData.studentPhNumber}
                onChange={handleChange}
                className="flex-1 px-2 py-1 text-gray-800 outline-none font-medium"
                required
              />
            </div>
          </div>

          {/* Parent Phone Number */}
          <div className="mb-4">
            <label className="block text-black font-semibold mb-2">
              Parent Phone Number
            </label>
            <div className="flex items-center border border-gray-300 rounded-md p-2">
            <FaPhone className="text-black mr-2" />

              <Select
                options={countryCodes}
                value={parentCountryCode}
                onChange={setParentCountryCode}
                placeholder="Select Code"
                className="mr-2 w-1/5"
              />
              <input
                name="parentNumber"
                type="number"
                placeholder="Enter Parent Phone Number"
                value={formData.parentNumber}
                onChange={handleChange}
                className="flex-1 px-2 py-1 text-gray-800 outline-none font-medium"
                required
              />
            </div>
          </div>


      <div className="mb-4">
            <label className="block text-black font-semibold mb-2">Mode of Study</label>
            <div className="flex items-center border border-gray-300 rounded-md p-2">
              <FaBookOpen className="text-black mr-2" />
              <select
                name="modeOfStudy"
                value={formData.modeOfStudy}
                onChange={handleChange}
                className="w-full px-3 py-2 text-gray-800 font-medium"
                required
              >
                <option value="" disabled>Select Mode</option>
                <option value="Online">Online</option>
                <option value="Offline">Offline</option>
              </select>
            </div>
          </div>

      <button
        type="submit"
        className={`w-full py-3 text-white font-semibold rounded-md mt-4 ${
          loading
            ? "bg-gray-500 cursor-not-allowed"
            : "bg-blue-500 hover:bg-blue-600"
        }`}
        disabled={loading}
      >
        {loading ? "Submitting..." : "Submit"}
      </button>
    </>
  ) : (
    <div className="mb-4">
      <label
        htmlFor="excelUpload"
        className="block text-black font-semibold mb-2"
      >
        Upload Excel
      </label>
      <div className="flex items-center border border-gray-300 rounded-md p-2">
        <FaUpload className="text-black mr-2" />
        <input
          id="excelUpload"
          type="file"
          accept=".xlsx, .xls"
          onChange={handleFileUpload}
          className="flex-1 px-2 py-1 text-gray-800 outline-none"
        />
      </div>
      <button
        type="submit"
        className={`w-full py-3 text-white font-semibold rounded-md mt-4 ${
          loading
            ? "bg-gray-500 cursor-not-allowed"
            : "bg-blue-500 hover:bg-blue-600"
        }`}
        disabled={loading}
      >
        {loading ? "Submitting..." : "Submit"}
      </button>
    </div>
  )}
        </form>

      </div>
    </div>
  );
}
