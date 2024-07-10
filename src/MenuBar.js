import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './App.css';

const dancerNames = [
  'Rahul', 'Angad', 'Avnoor', 'Bahaar', 'Bhajneek', 'Jasjeet',
  'Karan S.', 'Meher', 'Omid', 'Palk', 'Rhea', 'Karan T.', 'Simran', 'Tanvi'
];

const MenuBar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="menu-bar">
      <button className="menu-button" onClick={toggleMenu}>
        &#9776; {/* Menu icon */}
      </button>
      <h1 className="menu-heading"><Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>Run Throughs</Link></h1>
      <div className={`side-menu ${isOpen ? 'open' : ''}`}>
        <button className="close-button" onClick={toggleMenu}>&times;</button>
        <ul>
          {dancerNames.map((name) => (
            <li key={name}>
              <Link to={`/dancer/${name}`} onClick={toggleMenu}>{name}</Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default MenuBar;
