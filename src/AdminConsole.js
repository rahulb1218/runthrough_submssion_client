import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminConsole = () => {
  const [assignments, setAssignments] = useState([]);
  const [newAssignment, setNewAssignment] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    console.log('Fetching assignment in AdminConsole...');
    try {
      const response = await fetch('https://boiling-sea-64676-b8976c1f4ca6.herokuapp.com/assignments');
      const result = await response.json();
      console.log('Assignments fetched in AdminConsole:', result.data);
      setAssignments(result.data);
    } catch (error) {
      console.error('Error fetching assignments in AdminConsole:', error);
    }
  };

  const handleAddAssignment = async () => {
    console.log('Adding new assignment:', newAssignment);
    try {
      await fetch('https://boiling-sea-64676-b8976c1f4ca6.herokuapp.com/assignments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ assignment: newAssignment }), // Change 'name' to 'assignment'
      });
      setNewAssignment('');
      fetchAssignments();
    } catch (error) {
      console.error('Error adding assignment:', error);
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  const handleLogin = () => {
    if (password === 'tamasha') {
      setIsAuthenticated(true);
    } else {
      alert('Incorrect password');
    }
  };

  const handleReset = async () => {
    console.log('Resetting assignments and submissions');
    try {
      await fetch('https://boiling-sea-64676-b8976c1f4ca6.herokuapp.com/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: 'your_reset_password' }),
      });
      fetchAssignments();
    } catch (error) {
      console.error('Error resetting data:', error);
    }
  };

  return (
    <div className="admin-console">
      {!isAuthenticated ? (
        <div>
          <h1>Admin Login</h1>
          <input
            type="password"
            placeholder="Enter Admin Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={handleLogin}>Login</button>
        </div>
      ) : (
        <div>
          <h1>Admin Console</h1>
          <div>
            <input
              type="text"
              placeholder="New Assignment"
              value={newAssignment}
              onChange={(e) => setNewAssignment(e.target.value)}
            />
            <button onClick={handleAddAssignment}>Add Assignment</button>
          </div>
          <button onClick={handleBack}>Back to Home</button>
          <button onClick={handleReset}>Reset Assignments and Submissions</button>
          <ul>
            {assignments.map((assignment) => (
              <li key={assignment.assignment}>{assignment.assignment}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AdminConsole;
