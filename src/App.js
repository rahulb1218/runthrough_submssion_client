import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import AdminConsole from './AdminConsole';
import './App.css';
import VideoEmbed from './VideoEmbed';
import MenuBar from './MenuBar';
import DancerDetails from './DancerDetails';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';

const dancerNames = [
  'Rahul', 'Angad', 'Avnoor', 'Bahaar', 'Bhajneek', 'Jasjeet',
  'Karan S.', 'Meher', 'Omid', 'Palk', 'Rhea', 'Karan T.', 'Simran', 'Tanvi'
];

const App = () => {
  const [dancer, setDancer] = useState(dancerNames[0]);
  const [videolink, setVideoLink] = useState('');
  const [submissions, setSubmissions] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState('');

  const fetchSubmissions = async () => {
    console.log(`Fetching submissions from https://boiling-sea-64676-b8976c1f4ca6.herokuapp.com/submissions`);
    try {
      const response = await fetch(`https://boiling-sea-64676-b8976c1f4ca6.herokuapp.com/submissions`);
      const result = await response.json();
      console.log('Submissions fetched:', result.data);
      setSubmissions(result.data);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    }
  };

  const fetchAssignments = async () => {
    console.log(`Fetching assignments from https://boiling-sea-64676-b8976c1f4ca6.herokuapp.com/assignments`);
    try {
      const response = await fetch(`https://boiling-sea-64676-b8976c1f4ca6.herokuapp.com/assignments`);
      const result = await response.json();
      setAssignments(result.data);
    } catch (error) {
      console.error('Error fetching assignments:', error);
    }
  };

  useEffect(() => {
    fetchSubmissions();
    fetchAssignments();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formattedVideoLink = videolink.startsWith('http://') || videolink.startsWith('https://') ? videolink : `https://${videolink}`;
    console.log(`Submitting to https://boiling-sea-64676-b8976c1f4ca6.herokuapp.com/submit`);
    try {
      await fetch(`https://boiling-sea-64676-b8976c1f4ca6.herokuapp.com/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ dancer, videolink: formattedVideoLink, assignment: selectedAssignment }),
      });
      fetchSubmissions();
      setVideoLink('');
      setSelectedAssignment('');
    } catch (error) {
      console.error('Error submitting video link:', error);
    }
  };

  const groupedSubmissions = submissions.reduce((acc, submission) => {
    if (!acc[submission.dancer]) {
      acc[submission.dancer] = {};
    }
    acc[submission.dancer][submission.assignment] = submission.videolink;
    return acc;
  }, {});

  return (
    <Router>
      <div className='everything'>
        <MenuBar />
        <Routes>
          <Route path="/embed/:videoLink" element={<VideoEmbed />} />
          <Route path="/admin" element={<AdminConsole />} />
          <Route path="/dancer/:name" element={<DancerDetails />} />
          <Route path="/" element={
            <div className="app">
              <form className="submission-form" onSubmit={handleSubmit}>
                <select value={dancer} onChange={(e) => setDancer(e.target.value)}>
                  {dancerNames.map((name) => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
                <select value={selectedAssignment} onChange={(e) => setSelectedAssignment(e.target.value)}>
                  <option value="">Select Assignment</option>
                  {assignments.map((assignment) => (
                    <option key={assignment.assignment} value={assignment.assignment}>{assignment.assignment}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Video Link"
                  value={videolink}
                  onChange={(e) => setVideoLink(e.target.value)}
                />
                <button type="submit">Submit</button>
              </form>
              <h2>Submissions</h2>
              <div className="submission-list">
                {dancerNames.map((name) => (
                  <div key={name} className="dancer-submissions">
                    <h3>{name}</h3>
                    <ul>
                      {assignments.map((assignment) => {
                        const submission = groupedSubmissions[name]?.[assignment.assignment];
                        // console.log(`Submission for ${name}, assignment ${assignment.assignment}:`, submission);
                        return (
                          <li key={assignment.assignment} style={{ backgroundColor: submission ? 'green' : 'red' }}>
                            {assignment.assignment}: {submission ? <a href={submission} target="_blank" rel="noopener noreferrer">Submitted</a> : 'Not submitted'}
                            {submission && (
                              <>
                                {' | '}
                                <Link to={`/embed/${encodeURIComponent(submission)}`}>View</Link>
                              </>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
              <Link to="/admin" className="admin-button">Admin Console</Link>
            </div>
          } />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
