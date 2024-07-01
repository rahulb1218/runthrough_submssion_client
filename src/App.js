import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch, Link } from 'react-router-dom';
import AdminConsole from './AdminConsole';
import './App.css';

const dancerNames = [
  'Rahul', 'Angad', 'Avnoor', 'Bahaar', 'Bhajneek', 'Jasjeet', 
  'Karan S.', 'Meher', 'Omid', 'Palk', 'Rhea', 'Karan T.', 'Simran'
];

const App = () => {
  const [dancer, setDancer] = useState(dancerNames[0]);
  const [videoLink, setVideoLink] = useState('');
  const [submissions, setSubmissions] = useState([]);

  const fetchSubmissions = async () => {
    try {
      const response = await fetch('https://boiling-sea-64676-b8976c1f4ca6.herokuapp.com/submissions');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const result = await response.json();
      setSubmissions(result.data);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formattedVideoLink = videoLink.startsWith('http://') || videoLink.startsWith('https://') ? videoLink : `https://${videoLink}`;
    try {
      await fetch('https://boiling-sea-64676-b8976c1f4ca6.herokuapp.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ dancer, videoLink: formattedVideoLink }),
      });
      fetchSubmissions();
      setVideoLink('');
    } catch (error) {
      console.error('Error submitting video link:', error);
    }
  };

  const groupedSubmissions = submissions.reduce((acc, submission) => {
    if (!acc[submission.dancer]) {
      acc[submission.dancer] = [];
    }
    acc[submission.dancer].push(submission.videoLink);
    return acc;
  }, {});

  return (
    <Router>
      <Switch>
        <Route path="/admin">
          <AdminConsole />
        </Route>
        <Route path="/">
          <div className="app">
            <h1>Run Throughs</h1>
            <form className="submission-form" onSubmit={handleSubmit}>
              <select value={dancer} onChange={(e) => setDancer(e.target.value)}>
                {dancerNames.map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Video Link"
                value={videoLink}
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
                    {groupedSubmissions[name] ? groupedSubmissions[name].map((link, index) => (
                      <li key={index}>
                        <a href={link.startsWith('http://') || link.startsWith('https://') ? link : `https://${link}`} target="_blank" rel="noopener noreferrer">{link}</a>
                      </li>
                    )) : <li>No submissions yet</li>}
                  </ul>
                </div>
              ))}
            </div>
            <Link to="/admin" className="admin-button">Admin Console</Link>
          </div>
        </Route>
      </Switch>
    </Router>
  );
};

export default App;
