import React, { useState } from 'react';
import UploadForm from './components/UploadForm';
import ResultsDisplay from './components/ResultsDisplay';
import './App.css';

function App() {
  const [results, setResults] = useState(null);

  return (
    <div className='App'>
      <h1>Degree Fast-Track Planner</h1>
      <UploadForm setResults={setResults} />
      {results && <ResultsDisplay results={results} />}
    </div>
  );
}

export default App;
