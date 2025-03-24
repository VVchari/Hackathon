const express = require('express');
const pdfParse = require('pdf-parse');
const axios = require('axios');
const cors = require('cors');
const { parseResume, extractJsonFromResponse } = require('./utils/groqApi');
const {
  getStandardCourses,
  getTotalRequiredCredits,
  checkStandardCoursesCompleted,
  computeFastTrackPlan
} = require('./utils/courseMatcher');
require('dotenv').config();

const app = express();
const port = 5000;
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.post('/api/process-resume', async (req, res) => {
  try {
    const { resume } = req.body; // Base64-encoded PDF

    // Parse PDF
    let resumeText;
    try {
      resumeText = await pdfParse(Buffer.from(resume, 'base64')).then(
        (data) => data.text
      );
      console.log('Extracted Resume Text:', resumeText.slice(0, 200));
    } catch (error) {
      console.error('PDF Parsing Error:', error);
      return res.status(400).json({
        error: 'Failed to parse PDF. Ensure the uploaded file is valid.'
      });
    }

    // Parse resume with Groq API
    let parsedResume;
    try {
      const parsedResumeText = await parseResume(resumeText);
      console.log('Groq Response Text:', parsedResumeText);
      parsedResume = extractJsonFromResponse(parsedResumeText);
      console.log('Parsed Resume:', parsedResume);
    } catch (error) {
      console.error('Groq API Error:', error);
      return res
        .status(500)
        .json({ error: 'Failed to parse resume using Groq API.' });
    }

    // Validate parsed resume
    if (!parsedResume.UniversityName || !parsedResume.DegreeName) {
      console.error('Parsed resume missing required fields:', parsedResume);
      return res
        .status(400)
        .json({ error: 'Parsed resume is missing required fields.' });
    }

    // Load standard courses
    const standardCourses = getStandardCourses(
      parsedResume.UniversityName,
      parsedResume.DegreeName
    );
    const totalRequiredCredits = getTotalRequiredCredits(standardCourses);
    console.log('Standard Courses:', standardCourses);

    // Check completed courses via microservice
    let completed_courses, standard_credits;
    try {
      ({ completed_courses, standard_credits } =
        await checkStandardCoursesCompleted(parsedResume, standardCourses));
      console.log(
        'Completed Courses:',
        completed_courses,
        'Credits:',
        standard_credits
      );
    } catch (error) {
      console.error('Microservice Error:', error);
      return res
        .status(500)
        .json({ error: 'Failed to check completed courses.' });
    }

    // Compute fast-track plan
    const fastTrackPlan = computeFastTrackPlan(
      totalRequiredCredits,
      standard_credits
    );
    console.log('Fast-Track Plan:', fastTrackPlan);

    // Generate degree plan
    let degreePlan;
    try {
      const remainingCourses = standardCourses.filter(
        (course) => !completed_courses.includes(course['course name'])
      );
      const studentData = {
        university: parsedResume.UniversityName,
        degree: parsedResume.DegreeName,
        completed_credits: standard_credits,
        total_required_credits: totalRequiredCredits
      };
      console.log('Remaining Courses:', remainingCourses);
      degreePlan = await generateDegreePlan(remainingCourses, studentData);
      console.log('Degree Plan:', degreePlan);
    } catch (error) {
      console.error('Degree Plan Generation Error:', error);
      return res.status(500).json({ error: 'Failed to generate degree plan.' });
    }

    res.json({
      parsedResume,
      completedCourses: completed_courses,
      fastTrackPlan,
      degreePlan
    });
  } catch (error) {
    console.error('Error processing resume:', error);
    res.status(500).json({ error: 'Failed to process resume' });
  }
});
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

async function generateDegreePlan(remainingCourses, studentData) {
  //   const prompt = `
  //     Suggest a fast-track plan for ${studentData.degree} at ${
  //     studentData.university
  //   }.
  //     Completed: ${studentData.completed_credits}/${
  //     studentData.total_required_credits
  //   }.
  //     Remaining courses: ${JSON.stringify(remainingCourses, null, 2)}.
  //   `;
  const prompt = `
A student wants to fast-track their ${studentData.degree} at ${
    studentData.university
  }.
They have completed ${studentData.completed_credits} out of ${
    studentData.total_required_credits
  } credits.

Given these alternative credit options:
${JSON.stringify(remainingCourses, null, 2)}

Please provide:
1. A term-by-term fast-track plan
2. Alternative credit options (CLEP, AP, certifications) that can save time
3. Estimated time savings in weeks
4. Cost comparison between traditional courses and alternative paths
5. Prerequisites and course sequencing considerations

Focus on the fastest and most cost-effective way to complete the degree.
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
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  );
  return response.data.choices[0].message.content;
}
