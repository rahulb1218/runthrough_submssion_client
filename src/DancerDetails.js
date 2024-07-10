import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

const DancerDetails = () => {
  const { name } = useParams();
  const [submissions, setSubmissions] = useState([]);

  const fetchSubmissions = async () => {
    try {
      const response = await fetch(`https://boiling-sea-64676-b8976c1f4ca6.herokuapp.com/submissions`);
      const result = await response.json();
      const dancerSubmissions = result.data.filter(submission => submission.dancer === name);
      setSubmissions(dancerSubmissions);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [name]);

  return (
    <div>
      <h2>{name}'s Submissions</h2>
      <table>
        <thead>
          <tr>
            <th>Assignment</th>
            <th>Video Link</th>
            <th>View Critiques</th>
          </tr>
        </thead>
        <tbody>
          {submissions.map((submission, index) => (
            <tr key={index}>
              <td>{submission.assignment}</td>
              <td><a href={submission.videolink} target="_blank" rel="noopener noreferrer">View Video</a></td>
              <td><Link to={`/embed/${encodeURIComponent(submission.videolink)}`}>View Critiques</Link></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DancerDetails;
