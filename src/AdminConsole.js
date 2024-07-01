// src/AdminConsole.js
import React from 'react';
import { useHistory } from 'react-router-dom';

const AdminConsole = () => {
  const history = useHistory();

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
        alert('Submissions reset successfully!');
      } catch (error) {
        console.error('Error resetting submissions:', error);
      }
    } else {
      alert('Incorrect password!');
    }
  };

  const handleBack = () => {
    history.push('/');
  };

  return (
    <div className="admin-console">
      <h1>Admin Console</h1>
      <button onClick={handleReset}>Reset Current Week</button>
      <button onClick={handleBack}>Back to Home</button>
      {/* Add more admin features here */}
    </div>
  );
};

export default AdminConsole;
