import React from 'react';
import './GuideModal.css';

const GuideModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="guide-modal-overlay">
      <div className="guide-modal">
        <h2>How to Use UnSunny</h2>
        <p>
          Welcome to UnSunny! Here’s how to use the app to find the best side to sit on for maximum shade during your trip.
        </p>
        <ul>
          <li>Enter the starting point of your trip in the "Start Point" input box.</li>
          <li>Enter the destination point of your trip in the "End Point" input box.</li>
          <li>Choose the time of day for your trip. You can select the current time or specify a different time.</li>
          <li>Click the "Calculate Route" button to see the route and sun analytics.</li>
          <li>View the sun analytics to find out which side of the vehicle will give you the most shade.</li>
          <li>You can toggle between text and visual data representation using the provided buttons.</li>
        </ul>
        <button className="close-button" onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default GuideModal;
