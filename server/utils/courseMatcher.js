const fs = require('fs');
const path = require('path');
const csvParse = require('csv-parse/sync');
const axios = require('axios');

// Constants
const MICROSERVICE_URL =
  process.env.MICROSERVICE_URL || 'http://localhost:5001';
const CSV_FILENAME = 'filtered_caltech.csv';

function getStandardCourses(university, degree) {
  // Input validation
  if (!university || !degree) {
    throw new Error('University and degree are required');
  }

  const filePath = path.resolve(__dirname, '../data', CSV_FILENAME);

  try {
    const csvData = fs.readFileSync(filePath, 'utf8');
    const records = csvParse.parse(csvData, {
      columns: true,
      skip_empty_lines: true
    });

    // Log initial load
    console.log(`Loaded ${records.length} total courses`);

    // Map CSV columns to standardized format
    const standardizedRecords = records.map((row) => ({
      course_name: row['Course Name'],
      credits: row['Credits'],
      university: row['University'],
      degree: row['Degree'],
      alternative_path_1: row['Alternative Path 1'],
      alternative_path_2: row['Alternative Path 2']
    }));

    // Normalize inputs for comparison
    const normalizedUniversity = university.toLowerCase().trim();
    const normalizedDegree = degree.toLowerCase().trim();

    const matchingCourses = standardizedRecords.filter(
      (row) =>
        row.university.toLowerCase().trim() === normalizedUniversity &&
        row.degree.toLowerCase().trim() === normalizedDegree
    );

    console.log(
      `Found ${matchingCourses.length} matching courses for ${university}, ${degree}`
    );

    if (matchingCourses.length === 0) {
      console.log('Available combinations:');
      const combinations = new Set(
        records.map((r) => `${r.University} - ${r.Degree}`)
      );
      combinations.forEach((c) => console.log(`- ${c}`));
    }

    return matchingCourses;
  } catch (error) {
    console.error('Error loading course data:', error);
    throw error;
  }
}
function getTotalRequiredCredits(standardCourses) {
  if (!Array.isArray(standardCourses)) {
    console.error('Invalid input: standardCourses must be an array');
    return 0;
  }

  return standardCourses.reduce((sum, course) => {
    const credits = parseInt(course.credits || 0);
    if (isNaN(credits)) {
      console.warn(
        `Warning: Invalid credits for course: ${course.course_name}`
      );
      return sum;
    }
    return sum + credits;
  }, 0);
}

async function checkStandardCoursesCompleted(parsedResume, standardCourses) {
  // Validate inputs
  if (
    !parsedResume?.CoursesAndCertifications ||
    !Array.isArray(standardCourses)
  ) {
    console.error('Invalid inputs to checkStandardCoursesCompleted');
    return { completed_courses: [], standard_credits: 0 };
  }

  // Format standard courses for microservice
  const formattedStandardCourses = standardCourses.map((course) => ({
    'course name': course.course_name,
    credits: course.credits,
    'alternative path 1': course.alternative_path_1 || '',
    'alternative path 2': course.alternative_path_2 || ''
  }));

  // Extract resume course names
  const resumeCourses = parsedResume.CoursesAndCertifications.map(
    (c) => c.Name
  ).filter(Boolean);

  console.log('Matching courses:', {
    resumeCourses,
    standardCoursesCount: formattedStandardCourses.length
  });

  try {
    const response = await axios.post(
      `${MICROSERVICE_URL}/match-courses`,
      {
        resume_courses: resumeCourses,
        standard_courses: formattedStandardCourses
      },
      {
        timeout: 5000,
        headers: { 'Content-Type': 'application/json' }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Course matching service error:', error);
    return { completed_courses: [], standard_credits: 0 };
  }
}

// ...existing code for computeFastTrackPlan...
function computeFastTrackPlan(totalRequiredCredits, additionalCredits) {
  const completedCredits = additionalCredits;
  const creditsRemaining = Math.max(0, totalRequiredCredits - completedCredits);
  const timeSavedWeeks = totalRequiredCredits
    ? (additionalCredits / totalRequiredCredits) * 52
    : 0;
  return {
    new_completed_credits: completedCredits,
    credits_remaining: creditsRemaining,
    time_saved_weeks: Math.round(timeSavedWeeks * 10) / 10
  };
}

module.exports = {
  getStandardCourses,
  getTotalRequiredCredits,
  checkStandardCoursesCompleted,
  computeFastTrackPlan
};
