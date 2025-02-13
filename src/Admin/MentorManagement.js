import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import Swal from 'sweetalert2';
import axios from 'axios';
import Select from 'react-select';

const MentorManagement = () => {
  const [data, setData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({  name: '', email: '', PhNumber: '', location: '',Designation:'', userType: 'mentor' });

  const locations = ['vijayawada', 'hyderabad', 'bangalore'];
const  designations =["Python","Flask","Java","AdvancedJava","MySQL","DataScience","DataAnalytics","Frontend","SoftSkills","Aptitude"]
  // Fetch BDE data from API

  const fetchData = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/v1/mentor`);
      setData(response.data.mentors);
    } catch (error) {
      console.log(error)
    }
  };

  const handleDesignationChange = (selectedOptions) => {
    setFormData({ ...formData, Designation: selectedOptions ? selectedOptions.map(option => option.value) : [] });
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Open Add/Edit Modal
  const handleOpenModal = (mentor = null) => {
    setFormData(
      mentor
        ? { 
            id: mentor.id, 
            name: mentor.name || '', 
            email: mentor.email || '', 
            PhNumber: mentor.PhNumber || '', 
            location: mentor.location || locations[0], 
            Designation: Array.isArray(mentor.Designation) ? mentor.Designation : [], 
            userType: 'mentor'
          }
        : { 
            name: '', 
            email: '', 
            PhNumber: '', 
            location: locations[0], 
            Designation: [], 
            userType: 'mentor' 
          }
    );
    setIsModalOpen(true);
  };
  

  // Close Modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsSaving(false);
    setFormData({ name: '', email: '', PhNumber: '', location: '', userType: 'mentor', Designation:'' });
  };

  // Validate Email
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validate Phone Number
  const isValidPhone = (PhNumber) => {
    const phoneRegex = /^[9876]\d{9}$/;
    
    // Check if the number has 10 digits and is not a repeated sequence
    if (!phoneRegex.test(PhNumber)) return false;
    
    // Check for repeated digits (e.g., "1111111111", "2222222222")
    if (/^(\d)\1{9}$/.test(PhNumber)) return false;
  
    return true;
  };


  const handleSave = async () => {
    if (!formData.name || !formData.email || !formData.PhNumber || !formData.location) {
      Swal.fire({ icon: "error", title: "Please fill all fields." });
      return;
    }
  
    if (!isValidEmail(formData.email)) {
      Swal.fire({ icon: "error", title: "Invalid email format." });
      return;
    }
  
    if (!isValidPhone(formData.PhNumber)) {
      Swal.fire({ icon: "error", title: "Invalid phone number. Enter a valid 10-digit number." });
      return;
    }
  
    const isDuplicatePhone = data.some(
      (mentor) => mentor.PhNumber === formData.PhNumber && mentor.id !== formData.id
    );
    if (isDuplicatePhone) {
      Swal.fire({ icon: "error", title: "This phone number already exists." });
      return;
    }
  
    setIsSaving(true);
  
    const formattedData = {
      ...formData,
      Designation: formData.Designation,
    };
  
    try {
      let response;
  
      if (formData.id) {
        response = await axios.put(
          `${process.env.REACT_APP_BACKEND_URL}/api/v1/mentor`,
          formattedData
        );
      } else {
        response = await axios.post(
          `${process.env.REACT_APP_BACKEND_URL}/api/v1/mentor`,
          formattedData
        );
      }
  
      if (response.status === 200 || response.status === 201) {
        Swal.fire({
          icon: "success",
          title: formData.id ? "Updated successfully!" : "Added successfully!",
        });
  
        await fetchData(); // ✅ Fetch latest data before closing modal
        handleCloseModal();
      }
    } catch (error) {
      if (error.response) {
        // 🔹 Handle different status codes
        const errorMessage = error.response.data.message || "Something went wrong!";
  
        if (error.response.status === 400) {
          Swal.fire({
            icon: "error",
            title: "Bad Request!",
            text: errorMessage, // Backend message
          });
        } else if (error.response.status === 404) {
          Swal.fire({
            icon: "error",
            title: " Already Exist!",
            text: errorMessage, // Backend message for 404
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Operation failed!",
            text: errorMessage, // Generic backend message
          });
        }
      } else {
        // 🔹 If no response from server (Network Issue)
        Swal.fire({
          icon: "error",
          title: "Network Error!",
          text: "Unable to connect to the server. Please try again later.",
        });
      }
    }
  
    setIsSaving(false);
    handleCloseModal();
  };
  

   // Delete Mentor
   const handleDelete = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // Sending the ID as a parameter in the request body
          await axios.delete(`${process.env.REACT_APP_BACKEND_URL}/api/v1/mentor`, {
            params: { id }, 
          });
          const filteredData = data.filter((bde) => bde.id !== id);
          setData(filteredData);
          Swal.fire({ icon: "success", title: "Deleted successfully!" });
        } catch (error) {
          Swal.fire({ icon: "error", title: "Failed to delete Mentor." });
        }
      }
    });
    fetchData()
  };
  return (
    <div className="container mx-auto mt-8 px-4">
      <h2 className="text-2xl font-bold mb-6">Mentor Management</h2>
      <div className="flex justify-end mb-4">
        <button
          className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
          onClick={() => handleOpenModal()}
        >
          + Add Mentor
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 shadow-md rounded-lg">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="py-2 px-4 text-left font-semibold text-gray-700">Name</th>
              <th className="py-2 px-4 text-left font-semibold text-gray-700">Email</th>
              <th className="py-2 px-4 text-left font-semibold text-gray-700">Phone</th>
              <th className="py-2 px-4 text-left font-semibold text-gray-700">Location</th>
              <th className="py-2 px-4 text-left font-semibold text-gray-700">Desigation</th>
              <th className="py-2 px-4 text-left font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(data) && data.map((item,index) => (
              <tr key={index} className="border-b hover:bg-gray-50">
                <td className="py-2 px-4">{item.name}</td>
                <td className="py-2 px-4">{item.email}</td>
                <td className="py-2 px-4">{item.PhNumber}</td>
                <td className="py-2 px-4">{item.location}</td>
                <td className="py-2 px-4">{Array.isArray(item.Designation) ? item.Designation.join(', ') : 'N/A'}</td>
                <td className="py-2 px-4">
                  <button
                    className="text-blue-500 hover:text-blue-700 mr-3"
                    onClick={() => handleOpenModal(item)}
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="text-red-500 hover:text-red-700"
                    onClick={() => handleDelete(item.id)} // Deleting by ID
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isModalOpen && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl p-6 w-96">
          <h3 className="text-xl font-semibold mb-4 text-center text-gray-800">
            {formData.id ? "Edit Mentor" : "Add Mentor"}
          </h3>

          <form className="space-y-4">
            {/* Name Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Name</label>
              <input
                type="text"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                placeholder="Enter mentor's name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            {/* Email Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
              <input
                type="email"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                placeholder="Enter email address"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            {/* Phone Number Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Phone Number</label>
              <input
                type="number"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                placeholder="Enter phone number"
                value={formData.PhNumber}
                onChange={(e) => setFormData({ ...formData, PhNumber: e.target.value })}
              />
            </div>

            {/* Designation (Multi-Select) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Designation</label>
              <Select
                isMulti
                options={designations.map(subject => ({ value: subject, label: subject }))}
                value={Array.isArray(formData.Designation) ? formData.Designation.map(subject => ({ value: subject, label: subject })) : []}                
                onChange={handleDesignationChange}
                className="w-full border rounded-lg focus:outline-none"
              />
            </div>

            {/* Location Dropdown */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Location</label>
              <select
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              >
                {locations.map((location, index) => (
                  <option key={index} value={location}>{location}</option>
                ))}
              </select>
            </div>
          </form>

          {/* Action Buttons */}
          <div className="mt-6 flex justify-between">
            <button
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all"
              onClick={handleCloseModal}
            >
              Cancel
            </button>
            <button
            className={`px-4 py-2 rounded-lg text-white ${
              isSaving ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600 transition-all"
            }`}
            onClick={handleSave}
            disabled={isSaving} // Disable button while saving
          >
            {isSaving ? "Saving..." : formData.id ? "Update" : "Add"}
          </button>
          </div>
        </div>
      </div>
    )}

    </div>
  );
};

export default MentorManagement;
