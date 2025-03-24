const axios = require('axios');
require('dotenv').config();
GROQ_API_KEY = process.env.GROQ_API_KEY;
async function parseResume(resumeText) {
  const prompt = `
    You are a resume parser. Extract in valid JSON:
    - UniversityName (string)
    - DegreeName (string)
    - Skills (array)
    - CoursesAndCertifications (array of {Name, IssuingOrganization, Year})
    Resume: ${resumeText}
  `;
  const response = await axios.post(
    'https://api.groq.com/openai/v1/chat/completions',
    {
      model: 'llama3-8b-8192',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7
    },
    {
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  );
  return response.data.choices[0].message.content;
}

function extractJsonFromResponse(responseText) {
  const jsonMatch = responseText.match(/\{.*\}/s);
  if (!jsonMatch) throw new Error('No valid JSON found');
  return JSON.parse(jsonMatch[0]);
}

module.exports = { parseResume, extractJsonFromResponse };
