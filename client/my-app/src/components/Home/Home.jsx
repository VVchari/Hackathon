import React from 'react';
import './Home.css';
import { Link } from 'react-router-dom';
const Home = () => {
  return (
    <div className='home-container'>
      {/* Navbar */}
      <nav className='Navbar'>
        <div className='logo-container'>
          <img src='/image.png' />
          <h1 className='logo'>Accelgrad</h1>
        </div>
        <div className='auth-buttons'>
          <Link to='/upload'>
            {' '}
            <button className='get-started'>Get Started</button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className='hero-container'>
        <div className='hero'>
          <h1>
            Fast-Track Your Degree <br /> with AI-Powered Learning
          </h1>
          <p>
            Accelerate your academic journey with our innovative AI technology
            that creates personalized learning paths and optimizes your degree
            completion timeline.
          </p>
          <Link to='/upload'>
            <button className='start-journey'>Start Your Journey</button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
