import React, { useState } from 'react';
import './App.css';

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
      <h1 className="menu-heading">Run Throughs</h1>
      <div className={`side-menu ${isOpen ? 'open' : ''}`}>
        <button className="close-button" onClick={toggleMenu}>&times;</button>
        <p>Side Menu Content</p>
      </div>
    </div>
  );
};

export default MenuBar;
