import React from 'react';
import { FaUser, FaChartLine, FaBrain, FaEdit } from 'react-icons/fa';
import './Profile.css';
import { Link } from 'react-router-dom';

const Profile = ({ results }) => {
  const { parsedResume } = results;
  console.log(parsedResume);
  return (
    <div className='main-container'>
      {/* Sidebar */}
      <aside className='sidebar'>
        <div className='sidebar-logo'>
          <img src='/image.png' alt='Logo' />
          <h2 className='logo'>Accelgrad</h2>
        </div>
        <ul className='nav-list'>
          <Link to='/profile'>
            <li className='nav-item active'>
              <FaUser className='nav-icon' /> Profile
            </li>
          </Link>
          <Link to='/dashboard'>
            <li className='nav-item'>
              <FaChartLine className='nav-icon' /> Dashboard
            </li>
          </Link>
          <Link to='/ai-recommendations'>
            <li className='nav-item'>
              <FaBrain className='nav-icon' /> AI Recommendations
            </li>
          </Link>
        </ul>
      </aside>
      <div className='content'>
        {/* Profile Card */}
        <div className='profile-card'>
          <img
            src='https://api.dicebear.com/7.x/micah/svg?seed=JohnDoe'
            alt='User Avatar'
            className='profile-pic'
          />
          <div className='profile-info'>
            <h2>{parsedResume.name || parsedResume.Name}</h2>
          </div>
          <button className='edit-btn'>
            <FaEdit /> Edit Profile
          </button>
        </div>

        {/* Academic Information */}
        <div className='info-container'>
          <div className='info-box'>
            <h3>Personal Information</h3>
            <p>
              Email: <span>{parsedResume.Email}</span>
            </p>
            <p>
              Student ID: <span>{parsedResume.StudentId}</span>
            </p>
            <p>
              Location: <span>{parsedResume.Location}</span>
            </p>
          </div>

          <div className='info-box'>
            <h3>Academic Progress</h3>
            <p>
              University Name: <span>{parsedResume.UniversityName}</span>
            </p>
            <p>
              Degree: <span>{parsedResume.DegreeName}</span>
            </p>
            <p>
              Expected Graduation:{' '}
              <span>{parsedResume.ExpectedGraduation}</span>
            </p>
          </div>
        </div>

        {/* Skills & Certifications */}
        <div className='bottom-container'>
          <div className='skills-box'>
            <h3>Skills</h3>
            <div className='skills'>
              {parsedResume.Skills.map((skill, index) => (
                <span key={index}>{skill}</span>
              ))}
            </div>
          </div>

          <div className='certifications-box'>
            <h3>Certifications</h3>
            {parsedResume.CoursesAndCertifications.map((cert, index) => (
              <p key={index}>{cert.Name}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
