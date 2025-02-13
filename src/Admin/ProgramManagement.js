import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import Swal from 'sweetalert2';
import axios from 'axios';

const ProgramManagement = () => {
  const [data, setData] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({  name: '', email: '', PhNumber: '', location: '', userType: 'manager' });

  const locations = ['vijayawada', 'hyderabad', 'bangalore'];


  const fetchData = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/v1/manager`);

      setData(response.data.managers);
    } catch (error) {
      console.error('Error fetching manager data:', error);
    }
  };

  // Fetch BDE data from API
  useEffect(() => {
 

    fetchData();
  }, []);

  // Open Add/Edit Modal
  const handleOpenModal = (bde = null) => {
    setFormData(bde || {  name: '', email: '', PhNumber: '', location: locations[0], userType: 'manager' });
    setIsModalOpen(true);
  };

  // Close Modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsSaving(false);
    setFormData({ name: '', email: '', PhNumber: '', location: '', userType: 'manager' });
  };

  // Validate Email
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validate Phone Number
  const isValidPhone = (PhNumber) => {
    const phoneRegex =/^[9876]\d{9}$/;
    return phoneRegex.test(PhNumber);
  };



  // Save BDE (Add/Edit)
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
      Swal.fire({
        icon: "error",
        title: "Invalid phone number.",
        text: "Phone number must have exactly 10 digits.",
      });
      return;
    }
  
    setIsSaving(true); // Start loading state
  
    try {
      let response;
      const apiUrl = `${process.env.REACT_APP_BACKEND_URL}/api/v1/manager`;
  
      if (formData.id) {
        // 🔹 Update Existing Manager (PUT request)
        response = await axios.put(apiUrl, formData);
      } else {
        // 🔹 Add New Manager (POST request)
        response = await axios.post(apiUrl, formData);
      }
  
      if (response.status === 200 || response.status === 201) {
        Swal.fire({
          icon: "success",
          title: formData.id ? "Manager updated successfully!" : "Manager added successfully!",
        });
        fetchData(); // Refresh the list
      }
    } catch (error) {
      console.error("Error:", error);
      if (error.response) {
        const errorMessage = error.response.data.message || "Something went wrong!";
        const status = error.response.status;
  
        if (status === 400) {
          Swal.fire({ icon: "error", title: "Bad Request!", text: errorMessage });
        } else if (status === 404) {
          Swal.fire({ icon: "error", title: "Already Exists!", text: errorMessage });
        } else {
          Swal.fire({ icon: "error", title: "Operation failed!", text: errorMessage });
        }
      } else {
        Swal.fire({
          icon: "error",
          title: "Network Error!",
          text: "Unable to connect to the server. Please try again later.",
        });
      }
    }
  
    setIsSaving(false); // Stop loading state
    handleCloseModal();
  };
  

  // Delete Manager
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
          await axios.delete(`${process.env.REACT_APP_BACKEND_URL}/api/v1/manager`, {
            params: { id }, 
          });
          const filteredData = data.filter((bde) => bde.id !== id);
          setData(filteredData);
          Swal.fire({ icon: "success", title: "Deleted successfully!" });
        } catch (error) {
          Swal.fire({ icon: "error", title: "Failed to delete Manager." });
        }
      }
    });
    fetchData()
  };
  return (
    <div className="container mx-auto mt-8 px-4">
      <h2 className="text-2xl font-bold mb-6">Program Management</h2>
      <div className="flex justify-end mb-4">
        <button
          className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
          onClick={() => handleOpenModal()}
        >
          + Add Manager
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
              <th className="py-2 px-4 text-left font-semibold text-gray-700">User Type</th>
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
                <td className="py-2 px-4">{item.usertype}</td>
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

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96">
            <h3 className="text-lg font-bold mb-4">{formData.id ? 'Edit Manager' : 'Add Manager'}</h3>
            <form className="space-y-4">
              <input
                type="text"
                className="w-full px-4 py-2 border rounded focus:outline-none"
                placeholder="Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <input
                type="email"
                className="w-full px-4 py-2 border rounded focus:outline-none"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              <input
                type="text"
                className="w-full px-4 py-2 border rounded focus:outline-none"
                placeholder="Phone Number"
                value={formData.PhNumber}
                onChange={(e) => setFormData({ ...formData, PhNumber: e.target.value })}
              />
              <select
                className="w-full px-4 py-2 border rounded focus:outline-none"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              >
                {locations.map((location, index) => (
                  <option key={index} value={location}>{location}</option>
                ))}
              </select>
            
            </form>
            <div className="mt-4 flex justify-between">
              <button
                className="bg-red-500 text-white px-4 py-2 rounded"
                onClick={handleCloseModal}
              >
                Cancel
              </button>
              <button
                className={`px-4 py-2 rounded text-white ${
                  isSaving ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
                }`}
                onClick={handleSave}
                disabled={isSaving} // Disable the button during saving
              >
                {isSaving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgramManagement;
