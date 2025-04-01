import React from 'react';
import { Chrono } from 'react-chrono';
const terms = [
  {
    term: 1,
    courses: [
      'Blockchain Fundamentals (4 credits, $1063, 13 weeks)',
      'Mobile App Development (7 credits, $758, 10 weeks)',
      'Cybersecurity Principles (9 credits, $822, 8 weeks)'
    ],
    credits: 20,
    costSaved: 1982,
    timeSaved: 26,
    color: '#E3F2FD'
  },
  {
    term: 2,
    courses: [
      'Web Development (3 credits, $1259, 11 weeks)',
      'Data Science Fundamentals (4 credits, $545, 8 weeks)',
      'Big Data Analytics (6 credits, $1494, 12 weeks)'
    ],
    credits: 13,
    costSaved: 2057,
    timeSaved: 19,
    color: '#BBDEFB'
  },
  {
    term: 3,
    courses: [
      'Deep Learning (7 credits, $979, 13 weeks)',
      'Operating Systems (3 credits, $1158, 7 weeks)',
      'API Development (4 credits, $1446, 9 weeks)'
    ],
    credits: 14,
    costSaved: 2638,
    timeSaved: 22,
    color: '#90CAF9'
  },
  {
    term: 4,
    courses: [
      'Advanced Topics in Computer Science 1 (7 credits, $1158, 7 weeks)',
      'Artificial Intelligence (8 credits, $702, 12 weeks)',
      'Programming in Python (7 credits, $903, 6 weeks)',
      'Internet of Things (IoT) (3 credits, $1282, 12 weeks)'
    ],
    credits: 25,
    costSaved: 1077,
    timeSaved: 15,
    color: '#64B5F6'
  },
  {
    term: 5,
    courses: [
      'Advanced Database Management (6 credits, $669, 13 weeks)',
      'Computer Vision (7 credits, $525, 10 weeks)',
      'Software Architecture (7 credits, $681, 9 weeks)',
      'Network Security (4 credits, $885, 7 weeks)'
    ],
    credits: 24,
    costSaved: 0,
    timeSaved: 0,
    color: '#42A5F5'
  }
];
const alternatePath = [
  {
    term: 1,
    courses: [
      'IBM Blockchain Fundamentals Certificate ($350, 3 weeks)',
      'CLEP Mobile App Development Exam($216, 1 week)',
      'AP Cybersecurity Principles Exam($441, 1 week)'
    ],
    costSaved: 1982,
    timeSaved: 26,
    color: '#FFF9C4'
  },
  {
    term: 2,
    courses: [
      'No alternative',
      'Google Data Science Fundamentals Certificate  ($490, 6 weeks)',
      'AWS Big Data Analytics Certificate ($205, 5 weeks)'
    ],
    costSaved: 2057,
    timeSaved: 19,
    color: '#FFF59D'
  },
  {
    term: 3,
    courses: [
      'AWS Deep Learning ($248, 5 weeks)',
      'DSST Operating Systems Exam ($381, 1 week)',
      'AP Advanced Topics in Computer Science 1 Exam($316, 1 week)'
    ],
    costSaved: 2638,
    timeSaved: 22,
    color: '#FFF176'
  },
  {
    term: 4,
    courses: [
      'Google API Development Certificate ($368, 3 weeks)',
      'CLEP Artificial Intelligence Exam($415, 1 week)',
      'No alternative',
      'No alternative'
    ],
    costSaved: 1077,
    timeSaved: 15,
    color: '#FFEE58'
  },
  {
    term: 5,
    courses: [
      'No alternative',
      'No alternative',
      'No alternative',
      'No alternative'
    ],
    costSaved: 0,
    timeSaved: 0,
    color: '#FFEB3B'
  }
];
const Hack = ({ backendResponse }) => {
  // Create Chrono items for each term
  const chronoItems = terms.map((term, index) => ({
    title: `Term ${term.term}`,
    cardTitle: `Term ${term.term}`,
    cardSubtitle: `Total Credits: ${term.credits}`,
    cardDetailedText: (
      <div>
        <h3>Standard Path</h3>
        <ul>
          {term.courses.map((text, i) => (
            <li key={i}>{text}</li>
          ))}
        </ul>
        {alternatePath[index] && (
          <>
            <h3>Alternate Path</h3>
            <ul>
              {alternatePath[index].courses.map((text, i) => (
                <li key={i}>{text}</li>
              ))}
            </ul>
          </>
        )}
        <p>
          <strong>Cost Saved:</strong> ${term.costSaved} |{' '}
          <strong>Time Saved:</strong> {term.timeSaved} weeks
        </p>
      </div>
    )
  }));
  console.log(chronoItems);
  return (
    <>
      <div className='w-full max-w-4xl' style={{ height: '950px' }}>
        <Chrono
          items={chronoItems}
          mode='VERTICAL_ALTERNATING'
          cardWidth={600}
          disableClickOnCircle
          hideControls
          scrollable={{ scrollbar: true }}
        />
      </div>
    </>
  );
};
export default Hack;
//

// import React, { useState, useEffect } from 'react';
// import { Chrono } from 'react-chrono';
// const parseDegreePlan = (backendResponse) => {
//   console.log('Inside parseDegreePlan, backendResponse:', backendResponse);
//   if (!backendResponse) return [];

//   const terms = backendResponse.split(/(?:\*\*Term\s+)|(?:### Term )/);
//   console.log('Split terms array:', terms);

//   const parsed = terms
//     .slice(1)
//     .map((term) => {
//       const lines = term
//         .split('\n')
//         .map((line) => line.trim())
//         .filter(Boolean);
//       console.log('Parsed lines for term:', lines);
//       if (lines.length === 0) return null;

//       const termNumber = lines[0].replace(/\D/g, ''); // Extract term number
//       let totalCredits = 0;
//       let timeSavings = 'N/A'; // Default if not found
//       const courses = [];

//       lines.forEach((line) => {
//         // Match course name, alternative path, and credits
//         const courseMatch = line.match(
//           /✅\s*\*\*(.+?)\*\*\s*→\s*(.+?)\s*\((.+?)\)\s*[–-]\s*(\d+)\s*credits/i
//         );
//         if (courseMatch) {
//           const courseName = courseMatch[1].trim();
//           const alternativePath = courseMatch[2].trim();
//           const method = courseMatch[3].trim();
//           const courseCredits = parseInt(courseMatch[4], 10);
//           totalCredits += courseCredits;
//           courses.push({
//             name: courseName,
//             alternativePath,
//             method,
//             credits: courseCredits
//           });
//         }

//         // Extract estimated time savings
//         if (line.toLowerCase().includes('estimated time savings')) {
//           const timeMatch = line.match(/estimated time savings:\s*(.+)/i);
//           if (timeMatch) {
//             timeSavings = timeMatch[1].trim();
//           }
//         }
//       });

//       console.log(
//         `Term ${termNumber}: totalCredits=${totalCredits}, courses=`,
//         courses,
//         'timeSavings=',
//         timeSavings
//       );

//       return {
//         title: `Term ${termNumber}`,
//         cardTitle: `Term ${termNumber}`,
//         cardSubtitle: `Total Credits: ${totalCredits} | Time Savings: ${timeSavings}`,
//         courses: courses
//       };
//     })
//     .filter(Boolean);

//   console.log('Parsed degree plan items:', parsed);
//   return parsed;
// };

// const Hack = ({ backendResponse }) => {
//   // Log the received backendResponse in the Hack component for debugging.
//   useEffect(() => {
//     console.log('Hack component received backendResponse:', backendResponse);
//   }, [backendResponse]);

//   const [chronoItemsList, setChronoItemsList] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);
//   useEffect(() => {
//     if (backendResponse) {
//       const parsedItems = parseDegreePlan(backendResponse);
//       console.log('Setting chronoItems to:', parsedItems);
//       setChronoItemsList(parsedItems);
//     }
//   }, [backendResponse]);
//   if (isLoading) {
//     return <div>Loading...</div>;
//   }

//   if (!chronoItemsList.length) {
//     return <div>No items to display</div>;
//   }
//   const chronoItems = chronoItemsList.map((term) => ({
//     title: term.title,
//     cardTitle: term.cardTitle,
//     cardSubtitle: term.cardSubtitle,
//     // Changed from cardContent
//     cardDetailedText: (
//       <div>
//         <h3>Standard Path</h3>
//         <ul>
//           {term.courses.map((course, i) => (
//             <li key={i}>
//               {course.name} → {course.method} ({course.credits} credits)
//             </li>
//           ))}
//         </ul>
//         <h3>Alternative Path</h3>
//         {term.courses.map((course, i) => {
//           if (course.alternativePath !== 'Course') {
//             return (
//               <>
//                 <ul>
//                   <li>
//                     {course.name} → {course.alternativePath} ({course.credits}{' '}
//                     credits)
//                   </li>
//                 </ul>
//               </>
//             );
//           }
//         })}
//       </div>
//     )
//   }));

//   console.log('Displaying ', chronoItems);

//   return (
//     <>
//       <div className='w-full max-w-4xl' style={{ height: '950px' }}>
//         <Chrono
//           items={chronoItems}
//           mode='VERTICAL_ALTERNATING'
//           cardWidth={600}
//           disableClickOnCircle
//           hideControls
//           scrollable={{ scrollbar: true }}
//         />
//       </div>
//     </>
//   );
// };

// export default Hack;
