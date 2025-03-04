import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import { encryptData } from '../../cryptoUtils.jsx'; // Import encryption method
import './StudentLogin.css';
import Swal from 'sweetalert2/dist/sweetalert2.min.js';
import Footer from '../Footer/Footer';

export default function StudentLogin({ setIsAuthenticated }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const isEmail = username.includes('@');
      const payload = isEmail
        ? { email: username.toLowerCase(), password }
        : { studentId: username, password };

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/login`,
        payload
      );

      if (response.status === 200) {
        setIsAuthenticated(true);
        
        // Encrypt and store sensitive data in localStorage
        const id = response.data.id;
        const userType = response.data.user.usertype;
        const encryptedId = encryptData(id);
        const encryptedEmail = encryptData(response.data.user.email);
        // const encryptedProfile = encryptData(response.data.user.Profile);
        const encryptedLocation = encryptData(response.data.Location);
        const encryptUserType = encryptData(userType);

        localStorage.setItem('id', encryptedId);
        localStorage.setItem('profileStatus', response.data.user.Profile);
        localStorage.setItem('userType', encryptUserType);
        localStorage.setItem('email', encryptedEmail);
        localStorage.setItem('student_id', encryptedId);
        localStorage.setItem('location', encryptedLocation);
        localStorage.setItem(`${userType}`, encryptedId);

        const userRoutes = {
          student_login_details: '/student-profile',
          Mentors: '/mentor-dashboard',
          BDE_data: '/jobs-dashboard',
          Manager: '/viewbatch',
          super: '/admin-dashboard',
          superAdmin: '/reports',
        };
        const redirectTo = userRoutes[userType] || '/not-found';
        navigate(redirectTo);

        Swal.fire({
          title: 'Login Successful',
          icon: 'success',
        });
      }
    } catch (error) {
      console.error('Login failed:', error);

      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        Swal.fire({
          icon: 'error',
          title: 'Network Error',
          text: 'Please check your internet connection and try again.',
        });
      } else if (error.response?.status === 404) {
        Swal.fire({
          icon: 'error',
          title: 'User not found. Please check your details.',
        });
      } else if (error.response?.status === 400) {
        Swal.fire({
          icon: 'error',
          title: 'Invalid credentials. Please try again.',
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'An unexpected error occurred. Please try later.',
        });
      }
    } finally {
      setLoading(false); // Reset loading to false
    }
  };

  return (
    <>
      <div className="min-h-screen flex row items-center justify-center bg-cover bg-center px-4 sm:px-6 lg:px-8 student-login-container">
        <div className="flex flex-col md:flex-row items-center justify-center w-full max-w-7xl space-y-8 md:space-y-0 md:space-x-8">
          {/* Cartoon Image */}
          <div className="flex justify-center items-center w-full md:w-1/2">
            <img
              src="https://res.cloudinary.com/db2bpf0xw/image/upload/v1734849448/login-cartoon_znh33j.webp"
              alt="Cartoon logo"
              className="w-full max-w-lg"
            />
          </div>

          {/* Login Form */}
          <div className="w-full md:w-1/3">
            <div className="bg-white shadow-lg rounded-lg p-8 border border-gray-200">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 text-center mb-2">
                Login
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email or Student ID */}
                <div>
                  <label
                    htmlFor="username"
                    className="block text-sm font-medium text-black mb-1"
                  >
                    Email
                  </label>
                  <input
                    type="text"
                    id="username"
                    className="block w-full p-1 text-lg border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 border-gray-300"
                    placeholder="Enter Your Email"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>

                {/* Password */}
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      className="block w-full p-1 text-lg border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 border-gray-300"
                      placeholder="Enter Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-4 flex items-center text-gray-500 hover:text-gray-700"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <Eye size={15} /> : <EyeOff size={15} />}
                    </button>
                  </div>
                  <div className="flex justify-end mt-1">
                    <Link
                      to="/forgotPassword"
                      className="text-sm text-[#0737EE] font-semibold hover:underline"
                    >
                      Forgot Password?
                    </Link>
                  </div>
                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  className={`w-full py-2 px-4 mt-0 text-2xl font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    loading
                      ? 'bg-gray-500 cursor-not-allowed'
                      : 'bg-[#0737EE] hover:bg-blue-700'
                  }`}
                  disabled={loading} // Disable button during loading
                >
                  {loading ? 'Loading...' : 'Login'} {/* Change button text during loading */}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
