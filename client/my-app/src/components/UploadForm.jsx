import React, { useState } from 'react';
import axios from 'axios';

function UploadForm({ setResults }) {
  const [file, setFile] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result.split(',')[1];
      try {
        const response = await axios.post(
          'http://localhost:5000/api/process-resume',
          { resume: base64String }
        );
        setResults(response.data);
      } catch (error) {
        console.error('Error uploading resume:', error);
        alert('Failed to process resume');
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type='file'
        accept='.pdf'
        onChange={(e) => setFile(e.target.files[0])}
      />
      <button type='submit'>Analyze Resume</button>
    </form>
  );
}

export default UploadForm;
