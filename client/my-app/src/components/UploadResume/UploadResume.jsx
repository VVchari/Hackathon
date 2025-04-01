import React, { useState } from 'react';
import './UploadResume.css';
import { FaCloudUploadAlt } from 'react-icons/fa';
import { FaCheckCircle } from 'react-icons/fa';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
const UploadResume = ({ setResults }) => {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate('/profile', { replace: true });
  };
  const [file, setFile] = useState(null);
  const [isReady, setIsReady] = useState(false);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setIsReady(true);
    }
  };

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
        console.log(response.data);
        setResults(response.data);
        handleStart();
      } catch (error) {
        console.error('Error uploading resume:', error);
        alert('Failed to process resume');
      }
    };
    reader.readAsDataURL(file);
  };
  return (
    <div className='upload-container'>
      <form onSubmit={handleSubmit}>
        <div className='upload-box'>
          <h2 className='h2'>Upload Your Resume</h2>
          <div className='drop-area'>
            <FaCloudUploadAlt size={50} className='upload-icon' />
            <p>Drag and drop your resume here or click to browse</p>
            <input
              type='file'
              id='file-upload'
              onChange={handleFileChange}
              accept='.pdf'
              multiple={false}
            />
            <label htmlFor='file-upload' className='choose-file-btn'>
              Choose File
            </label>
          </div>

          {file && (
            <div className='file-info'>
              <span>{file.name}</span>
              <FaCheckCircle className='check-icon' />
              <span className='status'>Ready to upload</span>
            </div>
          )}

          <button className='process-btn' disabled={!isReady} type='submit'>
            Process Resume
          </button>
        </div>
      </form>
      <footer>© 2025 DegreeTrack AI. All rights reserved.</footer>
    </div>
  );
};

export default UploadResume;
