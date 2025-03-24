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
