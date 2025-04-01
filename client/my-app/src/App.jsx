import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './components/Home/Home';
import UploadResume from './components/UploadResume/UploadResume';
import Profile from './components/Profile/profile';
import Dashboard from './components/Dashboard/Dashboard';
import AIRecomandations from './components/AIRecomandations/AIRecomandations';
function App() {
  const [results, setResults] = useState(null);

  return (
    <>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route
          path='/upload'
          element={<UploadResume setResults={setResults} />}
        />
        <Route path='/profile' element={<Profile results={results} />} />
        <Route path='/dashboard' element={<Dashboard results={results} />} />
        <Route
          path='/ai-recommendations'
          element={<AIRecomandations results={results} />}
        />
        {/* Add more routes as needed */}
        {/* Example: <Route path="/results" element={<Results data={results} />} /> */}
      </Routes>
    </>
  );
}

export default App;
