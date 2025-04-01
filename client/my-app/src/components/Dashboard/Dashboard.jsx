import React from 'react';
import { FaUser, FaChartLine, FaBrain } from 'react-icons/fa';
import './Dashboard.css';
import { Link } from 'react-router-dom';
import ReactApexChart from 'react-apexcharts';

const tableHeaderStyle = {
  padding: '10px',
  textAlign: 'center',
  borderBottom: '1px solid #ddd'
};

const tableCellStyle = {
  padding: '10px',
  borderBottom: '1px solid #ddd',
  textAlign: 'center',
  color: '#333333'
};

// Define default row colors if not provided by CSS

const Dashboard = ({ results }) => {
  if (!results || !results.fastTrackPlan || !results.remainingCourses) {
    return <div>Loading or no course data available.</div>;
  }
  const primaryRowColor = '#E6F2FF'; // Light blue shade
  const secondaryRowColor = '#F0F8FF';
  const { fastTrackPlan, remainingCourses } = results;
  console.log(fastTrackPlan);

  const pieChartData = [
    fastTrackPlan.new_completed_credits,
    fastTrackPlan.credits_remaining
  ];

  const pieChartOptions = {
    chart: {
      type: 'pie'
    },
    labels: ['Completed Credits', 'Remaining Credits'],
    colors: ['#17A2B8', '#FF6B6B'], // Teal & Coral

    legend: {
      labels: {
        colors: ['#ffffff', '#ffffff'],
        useSeriesColors: false
      }
    },

    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 200
          },
          legend: {
            position: 'bottom'
          }
        }
      }
    ]
  };

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
            <li className='nav-item'>
              <FaUser className='nav-icon' /> Profile
            </li>
          </Link>
          <Link to='/dashboard'>
            <li className='nav-item active'>
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
        <h1>Dashboard</h1>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            height: '100vh',
            flexDirection: 'column'
          }}
        >
          <h2>Student Credit Completion Overview</h2>
          <ReactApexChart
            options={pieChartOptions}
            series={pieChartData}
            type='pie'
            width={380}
          />

          <h2 style={{ textAlign: 'center', marginTop: '20px' }}>
            Remaining Courses
          </h2>
          <table
            style={{
              width: '90%',
              borderCollapse: 'collapse',
              marginTop: '20px'
            }}
          >
            <thead>
              <tr style={{ backgroundColor: '#007BFF' }}>
                <th style={tableHeaderStyle}>Course Name</th>
                <th style={tableHeaderStyle}>Credits</th>
              </tr>
            </thead>
            <tbody>
              {remainingCourses.map((course, index) => (
                <tr
                  key={index}
                  style={{
                    backgroundColor:
                      index % 2 === 0 ? primaryRowColor : secondaryRowColor
                  }}
                >
                  <td style={tableCellStyle}>{course.course_name}</td>
                  <td style={{ ...tableCellStyle, textAlign: 'center' }}>
                    {course.credits}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
