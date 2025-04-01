import React from 'react';
import { FaUser, FaChartLine, FaBrain } from 'react-icons/fa';
import './AIRecomandations.css';
import { Link } from 'react-router-dom';
import Hack from '../Hack/Hack';
const AIRecomandations = ({ results }) => {
  const { parsedResume, degreePlan } = results;
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
            <li className='nav-item '>
              <FaUser className='nav-icon' /> Profile
            </li>
          </Link>
          <Link to='/dashboard'>
            <li className='nav-item'>
              <FaChartLine className='nav-icon' /> Dashboard
            </li>
          </Link>
          <Link to='/ai-recommendations'>
            <li className='nav-item active'>
              <FaBrain className='nav-icon' /> AI Recommendations
            </li>
          </Link>
        </ul>
      </aside>
      <div className='content'>
        <Hack backendResponse={degreePlan} />
      </div>
    </div>
  );
};

export default AIRecomandations;
