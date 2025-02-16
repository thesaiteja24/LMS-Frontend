import React, { useState } from "react";
import Swal from "sweetalert2"; // Import SweetAlert

const EnquiryForm = () => {
  const now = new Date();

  // Format the date as "February 7, 2025"
  const currentDate = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(now);
  
  // Format the time as "10:30 AM"
  const currentTime = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true, // ✅ Ensures AM/PM format
  }).format(now);
   // HH:MM in 24-hour format
  
  const [formData, setFormData] = useState({
    Name: "",
    Email: "",
    Mobile: "",
    Role: "Student",
    Course: "", // Updated field
    "Page URL": "https://placements.codegnan.com/request-form",
    form_name: "Placement Request Form",
    Date: currentDate,
    Time: currentTime,
    form_id:'',
    "Remote IP":'',
    "Powered by":'',
    "User Agent":'',
    utm_medium:'',
    utm_source:'',
    utm_campaign:'',
    "Batches Preferences":'',
    "preferred_location":'',
    "Full Stack Developer Course in Bangalore":''

  });
  
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.Name.trim()) newErrors.Name = "Full Name is required.";
    if (!formData.Email.trim()) newErrors.Email = "Email is required.";
    if (!formData.Mobile.trim()) newErrors.Mobile = "Mobile number is required.";
    if (!formData.Course) newErrors.Course = "Please select a course."; // Validation for course_id
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(formData);
    
    if (validateForm()) {
      try {
        const response = await fetch("https://codegnan.amoga.io/api/v2/core/service/apt/trigger/website-9ht4s4", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        console.log(response);

        if (response.ok) {
          await response.json();
          Swal.fire({
            title: "Success!",
            text: "Our Team will contact you soon!!",
            icon: "success",
            confirmButtonColor: "#3b82f6",
          });

          // Clear the form after successful submission
          setFormData({
            Name: "",
            Email: "",
            Mobile: "",
            Role: "Student",
            Course: "",
            "Page URL": "https://placements.codegnan.com/request-form",
            form_name: "Enquiry Form",
          });
          setErrors({});
        } else {
          Swal.fire({
            title: "Error!",
            text: "Failed to submit the form. Please try again.",
            icon: "error",
            confirmButtonColor: "#d33",
          });
        }
      } catch (error) {
        Swal.fire({
          title: "Network Error!",
          text: "Please check your internet connection and try again.",
          icon: "warning",
          confirmButtonColor: "#f39c12",
        });
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cover bg-center px-4 sm:px-6 lg:px-8"
      style={{ backgroundImage: "url('https://res.cloudinary.com/db2bpf0xw/image/upload/v1734849445/login-bg_mn4squ.webp')" }}
    >
      <div className="flex flex-col md:flex-row items-center justify-center w-full max-w-7xl space-y-8 md:space-y-0 md:space-x-8">
        
        {/* Cartoon Image */}
        <div className="flex justify-center items-center w-full md:w-1/2">
          <img
            src="https://res.cloudinary.com/db2bpf0xw/image/upload/v1734849448/login-cartoon_znh33j.webp"
            alt="Cartoon logo"
            className="w-full max-w-lg"
          />
        </div>

        {/* Enquiry Form */}
        <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-md">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-6">
            Request Form
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Full Name Field */}
            <div>
              <label htmlFor="Name" className="block text-sm font-semibold text-gray-700">
                Full Name*
              </label>
              <input
                type="text"
                id="Name"
                name="Name"
                value={formData.Name}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md shadow-md border-gray-300 focus:ring-blue-500 focus:border-blue-500 p-3 text-gray-900 ${
                  errors.Name ? "border-red-500" : ""
                }`}
                placeholder="Enter your full name"
              />
              {errors.Name && <p className="text-sm text-red-500 mt-1">{errors.Name}</p>}
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="Email" className="block text-sm font-semibold text-gray-700">
                Email*
              </label>
              <input
                type="email"
                id="Email"
                name="Email"
                value={formData.Email}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md shadow-md border-gray-300 focus:ring-blue-500 focus:border-blue-500 p-3 text-gray-900 ${
                  errors.Email ? "border-red-500" : ""
                }`}
                placeholder="Enter your email"
              />
              {errors.Email && <p className="text-sm text-red-500 mt-1">{errors.Email}</p>}
            </div>

            {/* Mobile Field */}
            <div>
              <label htmlFor="Mobile" className="block text-sm font-semibold text-gray-700">
                Mobile*
              </label>
              <input
                type="tel" 
                id="Mobile"
                name="Mobile"
                value={formData.Mobile}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md shadow-md border-gray-300 focus:ring-blue-500 focus:border-blue-500 p-3 text-gray-900 ${
                  errors.Mobile ? "border-red-500" : ""
                }`}
                placeholder="Enter your mobile number"
              />
              {errors.Mobile && <p className="text-sm text-red-500 mt-1">{errors.Mobile}</p>}
            </div>

            {/* Role Selection */}
            <div>
              <label htmlFor="Role" className="block text-sm font-semibold text-gray-700">
                Role
              </label>
              <select
                id="Role"
                name="Role"
                value={formData.Role}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md shadow-md border-gray-300 focus:ring-blue-500 focus:border-blue-500 p-3 bg-white text-gray-900"
              >
                <option value="Student">Student</option>
                <option value="Job Seeker">Job Seeker</option>
                <option value="Working Professional">Working Professional</option>
              </select>
            </div>

            {/* Course ID Dropdown */}
            <div>
              <label htmlFor="Course" className="block text-sm font-semibold text-gray-700">
                Course ID*
              </label>
              <select
                id="Course"
                name="Course"
                value={formData.Course}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md shadow-md border-gray-300 focus:ring-blue-500 focus:border-blue-500 p-3 bg-white text-gray-900"
              >
                <option value="">Select a course</option>
                <option value="CS119">Data Analytics</option>
                <option value="CS118">Java FullStack</option>
                <option value="CS117">Python FullStack</option>
                <option value="CS106">Data Science</option>
              </select>
              {errors.Course && <p className="text-sm text-red-500 mt-1">{errors.Course}</p>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-md shadow-lg transition duration-300"
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EnquiryForm;
