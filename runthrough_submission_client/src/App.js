import React, { useState, useEffect } from 'react';

const App = () => {
  const [dancer, setDancer] = useState('');
  const [videoLink, setVideoLink] = useState('');
  const [submissions, setSubmissions] = useState([]);

  const fetchSubmissions = async () => {
    const response = await fetch('https://your-backend-url.herokuapp.com/submissions');
    const result = await response.json();
    setSubmissions(result.data);
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch('https://your-backend-url.herokuapp.com/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ dancer, videoLink }),
    });
    fetchSubmissions();
  };

  return (
    <div>
      <h1>Dance Video Submission</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Dancer Name"
          value={dancer}
          onChange={(e) => setDancer(e.target.value)}
        />
        <input
          type="text"
          placeholder="Video Link"
          value={videoLink}
          onChange={(e) => setVideoLink(e.target.value)}
        />
        <button type="submit">Submit</button>
      </form>
      <h2>Submissions</h2>
      <ul>
        {submissions.map((submission) => (
          <li key={submission.id}>{submission.dancer}: {submission.videoLink}</li>
        ))}
      </ul>
    </div>
  );
};

export default App;