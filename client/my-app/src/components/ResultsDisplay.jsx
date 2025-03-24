import React from 'react';

function ResultsDisplay({ results }) {
  const { parsedResume, completedCourses, fastTrackPlan, degreePlan } = results;

  return (
    <div>
      <h2>Results</h2>
      <h3>Parsed Resume</h3>
      <pre>{JSON.stringify(parsedResume, null, 2)}</pre>
      <h3>Completed Courses</h3>
      <ul>
        {completedCourses.map((course, idx) => (
          <li key={idx}>{course}</li>
        ))}
      </ul>
      <h3>Fast-Track Plan</h3>
      <p>
        Completed Credits: {fastTrackPlan.new_completed_credits} /{' '}
        {fastTrackPlan.credits_remaining + fastTrackPlan.new_completed_credits}
      </p>
      <p>Time Saved: {fastTrackPlan.time_saved_weeks} weeks</p>
      <h3>Degree Plan</h3>
      <pre>{degreePlan}</pre>
    </div>
  );
}

export default ResultsDisplay;
