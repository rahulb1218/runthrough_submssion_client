import React, { useState, useEffect } from 'react';
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
    try {
      await fetch('https://boiling-sea-64676-b8976c1f4ca6.herokuapp.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ dancer, videoLink }),
      });
      fetchSubmissions();
      setVideoLink('');
    } catch (error) {
      console.error('Error submitting video link:', error);
    }
  };

  const handleReset = async () => {
    const password = prompt('Enter password to reset:');
    if (password === 'edifier') {
      try {
        await fetch('https://boiling-sea-64676-b8976c1f4ca6.herokuapp.com/reset', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ password }),
        });
        fetchSubmissions();
      } catch (error) {
        console.error('Error resetting submissions:', error);
      }
    } else {
      alert('Incorrect password!');
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
    <div className="app">
      <h1>Dance Video Submission</h1>
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
                  <a href={link} target="_blank" rel="noopener noreferrer">{link}</a>
                </li>
              )) : <li>No submissions yet</li>}
            </ul>
          </div>
        ))}
      </div>
      <button className="reset-button" onClick={handleReset}>Reset</button>
    </div>
  );
};

export default App;
