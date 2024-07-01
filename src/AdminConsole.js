import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminConsole = () => {
  const [assignments, setAssignments] = useState([]);
  const [newAssignment, setNewAssignment] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const response = await fetch('https://boiling-sea-64676-b8976c1f4ca6.herokuapp.com/assignments');
      const result = await response.json();
      setAssignments(result.data);
    } catch (error) {
      console.error('Error fetching assignments:', error);
    }
  };

  const handleAddAssignment = async () => {
    try {
      await fetch('https://boiling-sea-64676-b8976c1f4ca6.herokuapp.com/assignments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newAssignment }),
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

  return (
    <div className="admin-console">
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
      <ul>
        {assignments.map((assignment) => (
          <li key={assignment.id}>{assignment.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default AdminConsole;
