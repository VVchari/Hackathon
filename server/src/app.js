const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const axios = require('axios');
const fs = require('fs');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = 3000;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());
// Set up Multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Groq API Key from .env file
GROQ_API_KEY = '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';

// Function to call Groq API for resume parsing
const parseResume = async (resumeText) => {
  if (!GROQ_API_KEY) {
    throw new Error('Missing Groq API Key. Set your API key in the .env file.');
  }

  const url = 'https://api.groq.com/openai/v1/chat/completions';
  const headers = {
    Authorization: `Bearer ${GROQ_API_KEY}`,
    'Content-Type': 'application/json'
  };

  const prompt = `
    You are a resume parser. Extract the following details in JSON format:
    - Skills
    - Field of study (Branch)
    - Courses and Certifications completed

    Resume:
    ${resumeText}
  `;

  const payload = {
    model: 'llama3-8b-8192',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7
  };

  const response = await axios.post(url, payload, { headers });
  if (response.status === 200) {
    return response.data.choices[0].message.content;
  } else {
    throw new Error(`Groq API Error: ${response.status} - ${response.data}`);
  }
};

// Route to handle PDF upload and processing
app.post('/upload', upload.single('resume'), async (req, res) => {
  try {
    // Validate file mimetype from multer (server-side)
    if (req.file.mimetype !== 'application/pdf') {
      throw new Error('Uploaded file is not a valid PDF.');
    }

    const pdfPath = req.file.path;
    const pdfBuffer = fs.readFileSync(pdfPath);

    let pdfData;
    try {
      pdfData = await pdfParse(pdfBuffer);
    } catch (parseError) {
      console.error('PDF Parsing Error:', parseError);
      throw new Error(
        'Failed to parse PDF. Please ensure the file is a valid PDF.'
      );
    }

    const resumeText = pdfData.text.trim();
    const parsedData = await parseResume(resumeText);

    // Clean up uploaded file
    fs.unlink(pdfPath, (err) => {
      if (err) console.error(`Error deleting file: ${err.message}`);
    });

    // Return the raw API response from Groq
    res.json({ success: true, data: parsedData });
  } catch (error) {
    console.error('Error in /upload route:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});
// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
