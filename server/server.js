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
  const prompt = `The student is currently enrolled at ${
    studentData.university
  }.
They have completed ${studentData.completed_credits} out of ${
    studentData.total_required_credits
  } credits.

### **Objective:**
✅ **Ignore all completed courses** – These should NOT be included in the plan.  
✅ **Ignore exams/certificates for completed courses** – If a course has already been taken, do NOT suggest its exam or certification.  
✅ **Optimize for time and cost** – Always prioritize the fastest and most affordable option (Course, Exam, or Certificate) for each remaining subject.  
✅ **Ensure the student completes the total required credits** while minimizing effort.  

### **Alternative Credit Options Available:**  
\`\`\`json
${JSON.stringify(remainingCourses, null, 2)}
\`\`\`

---

## **Degree Completion Plan**
Based on the provided information, I've designed a **term-by-term fast-track plan** to ensure the student **efficiently completes all remaining credits**.

---

## **Term-by-Term Fast-Track Plan**  

**Term 1:**  
1. **Recommended Path (Course OR Alternative Credit Option per Subject)**  
   - ✅ **Subject 1** → Most Cost & Time-Effective Choice (Course/Exam/Certificate) – X credits  
   - ✅ **Subject 2** → Most Cost & Time-Effective Choice (Course/Exam/Certificate) – X credits  
   - **Total credits: X**  

**Estimated time savings:** X weeks  
**Total credits earned:** X  

---

**Term 2:**  
1. **Recommended Path (Course OR Alternative Credit Option per Subject)**  
   - ✅ **Subject 3** → Most Cost & Time-Effective Choice (Course/Exam/Certificate) – X credits  
   - ✅ **Subject 4** → Most Cost & Time-Effective Choice (Course/Exam/Certificate) – X credits  
   - **Total credits: X**  

**Estimated time savings:** X weeks  
**Total credits earned:** X  

---

### **Final Credit Check**
✅ **Total required credits:** ${studentData.total_required_credits}  
✅ **Total earned credits after this plan:** ${
    studentData.total_required_credits
  }  
✅ **All remaining credits are completed using the fastest and most cost-effective approach.**  

---

## **Estimated Time & Cost Savings:**  
- **Time Savings:** By using alternative credit options, the student can save approximately **X weeks**.  
- **Cost Comparison:**  
  - **Traditional courses:** $X - $Y per year  
  - **Alternative credit options:**  
    - CLEP exams: $X per exam  
    - AP exams: $X per exam  
    - DSST exams: $X per exam  
    - Certifications: $X per certificate  

**Estimated total cost for alternative credit options:** $X - $Y  

---

## **Prerequisites & Course Sequencing Considerations:**  
- Some courses may have **prerequisites** that must be completed before taking alternative credit options.  
- Course sequencing must be considered (e.g., Finite Element Analysis may require a math background).  
- Students should consult **academic advisors** to ensure proper course alignment.  

By following this **fast-track plan**, the student will **fully complete their degree** at **${
    studentData.university
  }** in the shortest time possible while minimizing costs.

---

### **STRICT GUIDELINES – DO NOT DEVIATE FROM THIS FORMAT:**  
✅ **Ensure all remaining credits are completed.**  
✅ **DO NOT recommend completed courses, their exams, or their certificates.**  
✅ **Choose the fastest and most cost-effective option for each subject (course OR alternative credit).**  
✅ **Maintain the bold headings, bullet points, and fixed labels as shown.**  
✅ **Alternative credit options should ONLY be suggested if the full course is NOT selected.**  
✅ **Keep the term structure, estimated time savings, and cost breakdown exactly as shown.**  
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
