import React, { useState,useEffect } from 'react';
import axios from 'axios';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Swal from 'sweetalert2/dist/sweetalert2.min.js';
import './StudentProfile.css';
import { useStudentsData } from '../contexts/StudentsListContext';
import { useEdit } from '../contexts/EditContext';
import { useStudent } from '../contexts/StudentProfileContext';

const departmentList = ['CSE-AI & ML','ECE','EEE','IT','MECH','CIVIL','CSE-Blockchain','CSE-Cyber Security','CSE-Data Analytics',
    'CSE-Software Engineering','ECE-Embedded Systems','ECE-VLSI','MECH-Robotics','CSBS','BSC-CSE','BSC-AI','BSC-CSCS','BSC-Data Science','BSC-Data Analytics','BSC-Physics','BSC-Chemistry','BSC-Mathematics','BSC-Statistics',
    'BSC-Zoology','BSC-Botany','BCA','B.COM-Economics','B.COM-General','B.COM-Computer Application','B.COM-Finance','B.COM-Banking','B.COM-Business Process','B.COM-Management','MCA','MSC','BBA'
]

const StudentProfileV = () => {
    const [showPassword, setShowPassword] = useState(false);
const [showCPassword, setShowCPassword] = useState(false);
    const {fetchStudentsData } = useStudentsData();
    const email = localStorage.getItem("email");
    const { edit, setEdit } = useEdit();
    const {studentDetails, fetchStudentDetails } = useStudent();
    const [isDepartmentAdded, setIsDepartmentAdded] = useState(false);
    const [newDepartment, setNewDepartment] = useState('');
    const [departments, setDepartments] = useState(departmentList);
    const [arrearsCount, setArrearsCount] = useState('');

    const [formData, setFormData] = useState({
        name: studentDetails?.name || '',
        dob: studentDetails?.DOB || '',
        age: studentDetails?.age || '',
        gender: studentDetails?.gender || '',
        collegeUSNNumber: studentDetails?.collegeUSNNumber || '',
        githubLink: studentDetails?.githubLink || '',
        arrears: studentDetails?.arrears || true, // Defaulting to false
        arrearsCount:studentDetails?.ArrearsCount,
        qualification: studentDetails?.qualification || '',
        department: studentDetails?.department || '',
        password: studentDetails.password, // Should be empty for security reasons
        cpassword:  studentDetails.password, // Should be empty for security reasons
        state: studentDetails?.state || '',
        cityname: studentDetails?.city || '', 
        yearOfPassing: studentDetails?.yearOfPassing || '',
        collegeName: studentDetails?.collegeName || '',
        tenthStandard: studentDetails?.tenthStandard || '',
        tenthPassoutYear: studentDetails?.TenthPassoutYear || '',
        twelfthStandard: studentDetails?.twelfthStandard || '',
        twelfthPassoutYear: studentDetails?.TwelfthPassoutYear || '',
        profilePic: studentDetails?.profilePic || null,
        resume: studentDetails?.resume || null,
        highestGraduationPercentage: studentDetails?.highestGraduationpercentage || ''
    });

    const [age, setAge] = useState('');
    const [errors, setErrors] = useState({
        name: '',
        age: '',
        gender: '',
        collegeUSNNumber: '',
        githubLink: '',
        qualification: '',
        department: '',
        password: '',
        cpassword: '',
        state: '',
        cityname: '',
        yearOfPassing: '',
        collegeName: '',
        tenthStandard: '',
        twelfthStandard: '',
        highestGraduationPercentage: '',
    });

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };
    
    const toggleCPasswordVisibility = () => {
        setShowCPassword(!showCPassword);
    };

    // Skill related states
    const [skills, setSkills] = useState(['HTML', 'CSS', 'JavaScript', 'Python', 'Java', 'NodeJS', 'Reactjs', 'Angular', 'Vuejs', 'ML', 'Django', 'Spring Boot', 'C++', 'C#', 'Ruby', 'PHP', 'Swift', 'TypeScript', 'Go', 'Rust', 'Kotlin', 'SQL', 'Shell Scripting', 'VB.NET', 'MATLAB', 'R', 'AWS', 'DevOps']);
    const [selectedSkills, setSelectedSkills] = useState([]);
    const [currentSkill, setCurrentSkill] = useState('');
    const [isOther, setIsOther] = useState(false);
    const [newSkill, setNewSkill] = useState('');

    const handleArrearsChange = (e) => {
        const value = e.target.value === 'yes' ? true : false;
        setFormData({
            ...formData,
            arrears: value,
        });
        if (!value) {
            setArrearsCount(''); // Reset arrears count if 'No' is selected
        }
    };

    const handleArrearsCountChange = (e) => {
        const value = e.target.value;
        if (/^\d*$/.test(value)) { // ✅ Allow only numeric values
            setArrearsCount(value);
            setFormData(prevState => ({
                ...prevState,
                arrearsCount: value // ✅ Ensure formData is updated
            }));
        }
    };
    

    const handleDOBChange = (e) => {
        const selectedDate = e.target.value;
        const calculatedAge = calculateAge(selectedDate);
        
        setFormData(prevState => ({
            ...prevState,
            dob: selectedDate,
            age: calculatedAge // ✅ Ensure age is stored in formData
        }));
    
        setErrors(prevErrors => ({
            ...prevErrors,
            age: calculatedAge >= 18 ? '' : 'You must be at least 18 years old.'
        }));
    };
    
    const calculateAge = (dob) => {
        if (!dob) return ''; // Handle empty dob
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };
    
    
    

    const validateName = (name) => {
        return /^[a-zA-Z\s]+$/.test(name) ? '' : 'Name must contain only letters and spaces.';
    };

    

    const validateCollegeUSNNumber = (usn) => {
        return /^[a-zA-Z0-9]{1,12}$/.test(usn) ? '' : 'USN must be up to 12 alphanumeric characters.';
    };

    const validateGithubLink = (link) => {
        return /^(https?:\/\/)?(www\.)?github\.com\/[a-zA-Z0-9._-]+$/.test(link) ? '' : 'Invalid GitHub link. Please ensure it follows the format: https://github.com/username';
    };
    const validatePassword = (password) => {
        const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}$/;
        return passwordRegex.test(password) ? '' : 'Password must contain at least one uppercase letter, one lowercase letter, one digit, and be at least 6 characters long.';
    };

    const validateYearOfPassing = (year) => {
        return /^\d{4}$/.test(year) ? '' : 'Year of passing must be 4 digits.';
    };

    const validatePercentage = (percentage) => {
        return /^\d{2}$/.test(percentage) ? '' : 'Percentage must be 2  digits.';
    };
    const validateInput = (value) => {
        return /^[a-zA-Z0-9\s]*$/.test(value) ? '' : 'Input must not contain special characters.';
    };

    const validatePassoutYear = (year) => {
        return /^\d{4}$/.test(year) ? '' : 'Year must be exactly 4 digits.';
    };
    

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    
        let errorMessage = '';
        switch (name) {
            case 'gender':
                errorMessage = value ? '' : 'Please select a gender.';
                break;
            case 'name':
                errorMessage = validateName(value);
                break;
            case 'collegeUSNNumber':
                errorMessage = validateCollegeUSNNumber(value);
                break;
            case 'githubLink':
                errorMessage = validateGithubLink(value);
                break;
            case 'password':
                errorMessage = validatePassword(value);
                break;
            case 'cpassword':
                errorMessage = validatePassword(value);
                if (value !== formData.password) {
                    errorMessage = 'Password and Confirm Password do not match.';
                }
                break;
            case 'yearOfPassing': // ✅ Graduation passout year validation
            case 'tenthPassoutYear': // ✅ 10th passout year validation
            case 'twelfthPassoutYear': // ✅ 12th passout year validation
                errorMessage = validatePassoutYear(value);
                break;    
            
            case 'tenthStandard':
                errorMessage = validatePercentage(value);
                break;
            case 'twelfthStandard':
                errorMessage = validatePercentage(value);
                break;
            case 'highestGraduationPercentage':
                errorMessage = validatePercentage(value);
                break;
            case 'cityname':
            case 'state':
            case 'qualification':
            case 'collegeName':
                errorMessage = validateInput(value);
                break;
            default:
                break;
        }
    
        setErrors({
            ...errors,
            [name]: errorMessage,
        });
    };


    

    const handleFileChange = (e) => {
        const fieldName = e.target.name;
        const file = e.target.files[0];

        let validTypes = [];
        let maxSize = 0;
        if (fieldName === 'resume') {
            validTypes = ['application/pdf'];
            maxSize = 100 * 1024; // 100 KB
        } else if (fieldName === 'profilePic') {
            validTypes = ['image/jpeg', 'image/png', 'image/gif'];
            maxSize = 10 * 1024; // 10 KB
        }

        if (file) {
            if (!validTypes.includes(file.type)) {
                Swal.fire({
                    icon: 'error',
                    title: 'Invalid File Type',
                    text: fieldName === 'resume' ? 'Please upload a PDF document.' : 'Please upload an image file (JPEG, PNG, GIF).',
                });
                e.target.value = '';
                return;
            }

            if (file.size > maxSize) {
                Swal.fire({
                    icon: 'error',
                    title: 'File Too Large',
                    text: fieldName === 'resume' ? 'Resume must be less than 100 KB.' : 'Profile picture must be less than 10 KB.',
                });
                e.target.value = '';
                return;
            }

            setFormData({
                ...formData,
                [fieldName]: file,handleDOBChange
            });
        }
    };

    const handleSkillChange = (e) => {
        const value = e.target.value;
        setCurrentSkill(value);
        setIsOther(value === 'Other');
    };

    const addSkill = () => {
        const updatedSkill = newSkill.charAt(0).toUpperCase() + newSkill.slice(1);
        const skillToAdd = isOther ? updatedSkill : currentSkill;
        if (skillToAdd && !selectedSkills.includes(skillToAdd)) {
            setSelectedSkills([...selectedSkills, skillToAdd]);
            setCurrentSkill('');
            setIsOther(false);
            setNewSkill('');
            if (isOther && !skills.includes(skillToAdd)) {
                setSkills([...skills, skillToAdd]);
            }
        }
    };

    const removeSkill = (skill) => {
        const updatedSkills = selectedSkills.filter(item => item !== skill);
        setSelectedSkills(updatedSkills);
    };


    const addDepartment = () => {
        const updatedDepartment = newDepartment.charAt(0).toUpperCase() + newDepartment.slice(1);
        if (updatedDepartment && !departments.includes(updatedDepartment)) {
            setDepartments([...departments, updatedDepartment]);
            setFormData({ ...formData, department: updatedDepartment });
            setNewDepartment('');
            setIsDepartmentAdded(true); // Mark department as added
        }
    };
    const handleDepartmentChange = (e) => {
        const value = e.target.value;
        setFormData({ ...formData, department: value });
        setIsOther(value === 'Others');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setEdit(true);
    const newErrors = {
        name: validateName(formData.name),
        gender: formData.gender ? '' : 'Please select a gender.', 
        collegeUSNNumber: validateCollegeUSNNumber(formData.collegeUSNNumber),
        githubLink: validateGithubLink(formData.githubLink),
        password: validatePassword(formData.password),
        cpassword: formData.password !== formData.cpassword ? 'Password and Confirm Password do not match.' : '',
        yearOfPassing: validateYearOfPassing(formData.yearOfPassing),
        tenthPassoutYear: validatePassoutYear(formData.tenthPassoutYear), // ✅ 10th passout year validation
        twelfthPassoutYear: validatePassoutYear(formData.twelfthPassoutYear),
        tenthStandard: validatePercentage(formData.tenthStandard),
        twelfthStandard: validatePercentage(formData.twelfthStandard),
        highestGraduationPercentage: validatePercentage(formData.highestGraduationPercentage),
        age: formData.age >= 18 ? '' : 'You must be at least 18 years old.',
        state: validateInput(formData.state),
        cityname: validateInput(formData.cityname),
        qualification: validateInput(formData.qualification),
        collegeName: validateInput(formData.collegeName),
    };
    
    const hasErrors = Object.values(newErrors).some(error => error !== '');
    if (hasErrors) {
        setErrors(newErrors);
        return;
    }
    
     
    
        Swal.fire({
            title: 'Signing up...',
            text: 'Please wait while we process your registration',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading(),
        });
    
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/api/v1/signup`,
                {
                    name: formData.name,
                    email: email,
                    gender: formData.gender,
                    dob: formData.dob,
                    password: formData.password,
                    cityName: formData.cityname,
                    department: formData.department,
                    yearOfPassing: formData.yearOfPassing,
                    state: formData.state,
                    collegeName: formData.collegeName,
                    qualification: formData.qualification,
                    age: formData.age ? Number(formData.age) : calculateAge(formData.dob),
                    collegeUSNNumber: formData.collegeUSNNumber,
                    githubLink: formData.githubLink,
                    arrears: formData.arrears,
                    arrearsCount: formData.arrears ? Number(arrearsCount) : 0,  // ✅ Include arrears count
                    resume: formData.resume,
                    profilePic: formData.profilePic,
                    tenthStandard: Number(formData.tenthStandard),
                    tenthPassoutYear: formData.tenthPassoutYear,
                    twelfthStandard: Number(formData.twelfthStandard),
                    twelfthPassoutYear: formData.twelfthPassoutYear,
                    highestGraduationPercentage: Number(formData.highestGraduationPercentage),
                    studentSkills: selectedSkills,
                },
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            if (formData.resume) {
                const resumeFormData = new FormData();
                resumeFormData.append("resume", formData.resume);
                resumeFormData.append("student_id", localStorage.getItem("student_id")); // ✅ Append student_id
            
            
                try {
                    const atsResponse = await axios.post(
                        `${import.meta.env.VITE_BACKEND_URL}/api/v1/atscheck`,
                        resumeFormData,
                        { headers: { "Content-Type": "multipart/form-data" } }
                    );
            
                } catch (error) {
                    console.error("❌ Error sending resume to ATS API:", error);
                }
            } else {
                console.error("❌ Resume not found before sending to ATS API.");
            }
            
    

            
    
            await fetchStudentsData();
            await fetchStudentDetails();
    
            Swal.fire({
                title: 'Profile Successfully Updated',
                icon: 'success',
            });
            setEdit(!edit);
        } catch (error) {
            console.error("Error during signup:", error);
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Unable to update profile. Please try again.',
            });
        }
    };
    useEffect(() => {
        if (!studentDetails) return; // ⛔ Prevent errors when studentDetails is null
    
        setFormData({
            name: studentDetails.name || '',
            dob: studentDetails.DOB|| '',
            age: studentDetails.age || '',
            gender: studentDetails.gender && ["Male", "Female"].includes(studentDetails.gender) ? studentDetails.gender : '',
            collegeUSNNumber: studentDetails.collegeUSNNumber || '',
            githubLink: studentDetails.githubLink || '',
            arrears: studentDetails.arrears === "true",
            arrearsCount: studentDetails.ArrearsCount ? Number(studentDetails.ArrearsCount) : '',
            qualification: studentDetails.qualification || '',
            department: studentDetails.department || '',
            password: '', // Empty password field for security reasons
            cpassword: '', // Empty confirm password field for security reasons
            state: studentDetails.state || '',
            cityname: studentDetails.city || '',
            yearOfPassing: studentDetails.yearOfPassing || '',
            collegeName: studentDetails.collegeName || '',
            tenthStandard: studentDetails.tenthStandard || '',
            tenthPassoutYear: studentDetails.TenthPassoutYear || '', 
            twelfthStandard: studentDetails.twelfthStandard || '',
            twelfthPassoutYear: studentDetails.TwelfthPassoutYear || '',
            profilePic: studentDetails.profilePic || null,
            resume: studentDetails.resume || null,
            highestGraduationPercentage: studentDetails.highestGraduationpercentage || ''
        });
        
        setArrearsCount(studentDetails.ArrearsCount ? Number(studentDetails.ArrearsCount) : ''); // ✅ Update arrearsCount separately

        setSelectedSkills(studentDetails.studentSkills || []);
    
    }, [studentDetails]);
    

    return (
        <div className='student-profile-container '>
            <h1 style={{ color: "black" }} className='font-semibold text-3xl'>Student Profile</h1>
            <form onSubmit={handleSubmit} encType="multipart/form-data">
            <div className="input-group">
    {/* Name Field */}
    <div className="form-group">
        <label>Name <span style={{ color: 'red' }}>*</span></label>
        <input
            type="text"
            name="name"
            placeholder="Ex: Enter name"
            value={formData.name}
            onChange={handleChange}
            required
        />
        {errors.name && <p className="error-message">{errors.name}</p>}
    </div>

    {/* Date of Birth Field */}
    <div className="form-group">
    <label>Date of Birth <span style={{ color: 'red' }}>*</span></label>
    <input
        type="date"
        name="dob"
        value={formData.dob}
        onChange={handleDOBChange}
        required
    />
    {/* Display calculated age */}
    {formData.age && <p>Your age: {formData.age} years</p>}
    {errors.age && <p className="error-message">{errors.age}</p>}
</div>


 
</div>


                
<div className="input-group">
    {/* Password Field */}
    <div className="form-group">
        <label>New Password <span style={{ color: 'red' }}>*</span></label>
        <div className="password-wrapper">
            <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter Password"
                value={formData.password}
                onChange={handleChange}
                required
            />
            <FontAwesomeIcon 
                icon={!showPassword ? faEyeSlash : faEye} 
                className="password-icon"
                onClick={togglePasswordVisibility}
            />
        </div>
        {errors.password && <p className="error-message">{errors.password}</p>}
    </div>

    {/* Confirm Password Field */}
    <div className="form-group">
        <label>Confirm Password <span style={{ color: 'red' }}>*</span></label>
        <div className="password-wrapper">
            <input
                type={showCPassword ? "text" : "password"}
                name="cpassword"
                placeholder="Confirm Password"
                value={formData.cpassword}
                onChange={handleChange}
                required
            />
            <FontAwesomeIcon 
                icon={!showCPassword ? faEyeSlash : faEye} 
                className="password-icon"
                onClick={toggleCPasswordVisibility}
            />
        </div>
        {errors.cpassword && <p className="error-message">{errors.cpassword}</p>}
    </div>
</div>
                <div className="input-group">
                   
                    <div className="form-group">
                        <label>Gender <span style={{ color: 'red' }}>*</span></label>
                        <div className="radio-group">
                            <div className="radio-option">
                                <input
                                    type="radio"
                                    id="male"
                                    name="gender"
                                    value="Male"
                                    checked={formData.gender === "Male"}
                                    onChange={handleChange}
                                    required
                                />
                                <label htmlFor="male">Male</label>
                            </div>
                            <div className="radio-option">
                                <input
                                    type="radio"
                                    id="female"
                                    name="gender"
                                    value="Female"
                                    checked={formData.gender === "Female"}
                                    onChange={handleChange}
                                    required
                                />
                                <label htmlFor="female">Female</label>
                            </div>
                        </div>
                        {errors.gender && <p className="error-message">{errors.gender}</p>}
                    </div>
                    <div className="form-group">
                        <label>Highest Qualification <span style={{ color: 'red' }}>*</span></label>
                        <input
                            type="text"
                            name="qualification"
                            placeholder='Ex: Btech'
                            value={formData.qualification}
                            onChange={handleChange}
                            required
                        />
                        {errors.qualification && <p className="error-message">{errors.qualification}</p>}
                    </div>
                </div>
                <div className="input-group">
                    <div className="form-group">
                        <label>College USN/ID Number <span style={{ color: 'red' }}>*</span></label>
                        <input
                            type="text"
                            name="collegeUSNNumber"
                            placeholder='Ex: 100002108F00'
                            value={formData.collegeUSNNumber}
                            onChange={handleChange}
                            required
                        />
                        {errors.collegeUSNNumber && <p className="error-message">{errors.collegeUSNNumber}</p>}
                    </div>
                    <div className="form-group">
                        <label>Github Link <span style={{ color: 'red' }}>*</span></label>
                        <input
                            type="text"
                            name="githubLink"
                            placeholder='Ex: Enter github Url'
                            value={formData.githubLink}
                            onChange={handleChange}
                            required
                        />
                        {errors.githubLink && <p className="error-message">{errors.githubLink}</p>}
                    </div>
                </div>
                <div className="input-group">
                    <div className="form-group">
                        <label>City Name <span style={{ color: 'red' }}>*</span></label>
                        <input
                            type="text"
                            name="cityname"
                            placeholder='Ex: Vijayawada'
                            value={formData.cityname}
                            onChange={handleChange}
                            required
                        />
                        {errors.cityname && <p className="error-message">{errors.cityname}</p>}
                    </div>
                    <div className="form-group">
                        <label>You are from which State <span style={{ color: 'red' }}>*</span></label>
                        <input
                            type="text"
                            name="state"
                            placeholder='Ex: AndhraPradesh'
                            value={formData.state}
                            onChange={handleChange}
                            required
                        />
                        {errors.state && <p className="error-message">{errors.state}</p>}
                    </div>
                </div>
                <div className="input-group">
                    



                    <div className="form-group">
        <label>Department <span style={{ color: 'red' }}>*</span></label>
        <select
            name="department"
            value={formData.department}
            onChange={handleDepartmentChange}
            required
        >
            <option value="">Select Department <span style={{ color: 'red' }}>*</span></option>
            {departments.map((dept, index) => (
                <option key={index} value={dept}>{dept}</option>
            ))}
            <option value="Others">Others</option>
        </select>
        {isOther && !isDepartmentAdded && ( 
            <div>
                <input
                    type="text"
                    placeholder="Enter new department"
                    value={newDepartment}
                    onChange={(e) => setNewDepartment(e.target.value)}
                />
                <button type="button" onClick={addDepartment}>
                    Add Department
                </button>
            </div>
        )}
        {errors.department && <p className="error-message">{errors.department}</p>}
    </div>





                    <div className="form-group">
                        <label>Highest Qualification Year of Passing <span style={{ color: 'red' }}>*</span></label>
                        <input
                            type="text"
                            name="yearOfPassing"
                            placeholder='Ex: 2019'
                            value={formData.yearOfPassing}
                            onChange={handleChange}
                            required
                        />
                        {errors.yearOfPassing && <p className="error-message">{errors.yearOfPassing}</p>}
                    </div>
                </div>
              {/* Academic Information */}
<div className="input-group">
    {/* 10th Details */}
    <div className="form-group">
        <label>10th Percentage <span style={{ color: 'red' }}>*</span></label>
        <input
            type="text"
            name="tenthStandard"
            placeholder="Ex: 92"
            value={formData.tenthStandard}
            onChange={handleChange}
            required
        />
        {errors.tenthStandard && <p className="error-message">{errors.tenthStandard}</p>}
    </div>

    <div className="form-group">
        <label>10th Passout Year <span style={{ color: 'red' }}>*</span></label>
        <input
            type="text"
            name="tenthPassoutYear"
            placeholder="Ex: 2015"
            value={formData.tenthPassoutYear}
            onChange={handleChange}
            required
        />
         {errors.tenthPassoutYear && <p className="error-message">{errors.tenthPassoutYear}</p>}
    </div>
</div>

<div className="input-group">
    {/* 12th / Intermediate Details */}
    <div className="form-group">
        <label>12th Percentage <span style={{ color: 'red' }}>*</span></label>
        <input
            type="text"
            name="twelfthStandard"
            placeholder="Ex: 92"
            value={formData.twelfthStandard}
            onChange={handleChange}
            required
        />
        {errors.twelfthStandard && <p className="error-message">{errors.twelfthStandard}</p>}
    </div>

    <div className="form-group">
        <label>12th Passout Year <span style={{ color: 'red' }}>*</span></label>
        <input
            type="text"
            name="twelfthPassoutYear"
            placeholder="Ex: 2017"
            value={formData.twelfthPassoutYear}
            onChange={handleChange}
            required
        />
         {errors.twelfthPassoutYear && <p className="error-message">{errors.twelfthPassoutYear}</p>}
    </div>
</div>

<div className="input-group">
    {/* Graduation Details */}
    <div className="form-group">
        <label>Graduated College Name (PG/UG) <span style={{ color: 'red' }}>*</span></label>
        <input
            type="text"
            name="collegeName"
            placeholder="Ex: Codegnan"
            value={formData.collegeName}
            onChange={handleChange}
            required
        />
        {errors.collegeName && <p className="error-message">{errors.collegeName}</p>}
    </div>

    <div className="form-group">
        <label>Graduation Passout Year <span style={{ color: 'red' }}>*</span></label>
        <input
            type="text"
            name="yearOfPassing"
            placeholder="Ex: 2021"
            value={formData.yearOfPassing}
            onChange={handleChange}
            required
        />
        {errors.yearOfPassing && <p className="error-message">{errors.yearOfPassing}</p>}
    </div>
</div>

                <div className="input-group">
                    <div className="form-group">
                        <label>Graduated College Name(PG/UG) <span style={{ color: 'red' }}>*</span></label>
                        <input
                            type="text"
                            name="collegeName"
                            placeholder='Ex: Codegnan'
                            value={formData.collegeName}
                            onChange={handleChange}
                            required
                        />
                        {errors.collegeName && <p className="error-message">{errors.collegeName}</p>}
                    </div>
                    <div className="form-group">
                        <label>Percentage(Highest Graduation) <span style={{ color: 'red' }}>*</span></label>
                        <input
                            type="text"
                            name="highestGraduationPercentage"
                            placeholder='Ex: 92'
                            value={formData.highestGraduationPercentage}
                            onChange={handleChange}
                            required
                        />
                        {errors.highestGraduationPercentage && <p className="error-message">{errors.highestGraduationPercentage}</p>}
                    </div>
                </div>
                <div className="input-group">
                    <div className="form-group">
                        <label>Profile Picture (10 KB) <span style={{ color: 'red' }}>*</span></label>
                        <input
                            type="file"
                            name="profilePic"
                            accept=".jpg,.jpeg,.png,.gif"
                            onChange={handleFileChange}
                            required
                        />
                        {errors.profilePic && <p className="error-message">{errors.profilePic}</p>}
                    </div>
                    <div className="form-group">
                        <label>Resume (100KB - pdf) <span style={{ color: 'red' }}>*</span></label>
                        <input
                            type="file"
                            name="resume"
                            accept=".pdf"
                            onChange={handleFileChange}
                            required
                        />
                        {errors.resume && <p className="error-message">{errors.resume}</p>}
                    </div>
                </div>

                <div className="input-group">
                    <div>
                        <label>Skills: <span style={{ color: 'red' }}>*</span></label>
                        <select
                            id="skills"
                            name="skills"
                            value={currentSkill}
                            onChange={handleSkillChange}
                        >
                            <option value="">Select a skill</option>
                            {skills.map((skill, index) => (
                                <option key={index} value={skill}>{skill}</option>
                            ))}
                            <option value="Other">Other</option>
                        </select>

                        {isOther && (
                            <div>
                                <input
                                    type="text"
                                    placeholder="Enter a new skill"
                                    value={newSkill}
                                    onChange={(e) => setNewSkill(e.target.value)}
                                />
                            </div>
                        )}

                        <button type="button" className='add-skill' onClick={addSkill}>
                            Add Skill
                        </button>

                        <div className='selected-skills'>
                            {selectedSkills.map((skill, index) => (
                                <p key={index}>
                                    <span style={{ color: 'black' }}>{skill}</span>
                                    <button className='remove-skill' type='button' onClick={() => removeSkill(skill)}>X</button>
                                </p>
                            ))}
                        </div>
                    </div>
                    <div className="form-group">
    <label>Arrears <span style={{ color: 'red' }}>*</span></label>
    <div className="radio-group">
        <div className="radio-option">
            <input
                type="radio"
                id="arrearsYes"
                name="arrears"
                value="yes"
                checked={formData.arrears === true}
                onChange={handleArrearsChange}
                required
            />
            <label htmlFor="arrearsYes">Yes</label>
        </div>
        <div className="radio-option">
            <input
                type="radio"
                id="arrearsNo"
                name="arrears"
                value="no"
                checked={formData.arrears === false}
                onChange={handleArrearsChange}
                required
            />
            <label htmlFor="arrearsNo">No</label>
        </div>
    </div>
                    </div>

                    {/* Conditionally show input field for arrears count */}
                    {formData.arrears === true && (
                        <div className="form-group">
                            <label>How many arrears do you have? <span style={{ color: 'red' }}>*</span></label>
                            <input
                                type="text"
                                name="arrearsCount"
                                placeholder="Enter number of arrears"
                                value={arrearsCount}
                                onChange={handleArrearsCountChange}
                                required
                            />
                        </div>
                    )}

                </div>
                <button className='btn' type='submit'>Submit</button>
            </form>
        </div>
    );
};

export default StudentProfileV;