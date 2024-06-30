import React, { useState, useEffect } from 'react';

const App = () => {
  const [dancer, setDancer] = useState('');
  const [videoLink, setVideoLink] = useState('');
  const [submissions, setSubmissions] = useState([]);

  const fetchSubmissions = async () => {
    try {
      const response = await fetch('https://boiling-sea-64676.herokuapp.com/submissions');
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
      await fetch('https://boiling-sea-64676.herokuapp.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ dancer, videoLink }),
      });
      fetchSubmissions();
    } catch (error) {
      console.error('Error submitting video link:', error);
    }
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
