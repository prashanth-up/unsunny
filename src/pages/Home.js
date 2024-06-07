import React, { useState } from 'react';
import Map from '../components/Map';
import './Home.css';

function Home() {
  const [startPoint, setStartPoint] = useState('');
  const [endPoint, setEndPoint] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="home-container">
      <h1>Welcome to UnSunny</h1>
      <p>Find the optimal route for maximum shade.</p>
      <form onSubmit={handleSubmit} className="form-container">
        <div className="input-container">
          <label>Start Point:</label>
          <input
            type="text"
            value={startPoint}
            onChange={(e) => setStartPoint(e.target.value)}
            placeholder="Enter start location"
          />
        </div>
        <div className="input-container">
          <label>End Point:</label>
          <input
            type="text"
            value={endPoint}
            onChange={(e) => setEndPoint(e.target.value)}
            placeholder="Enter end location"
          />
        </div>
        <button type="submit" className="submit-button">Find Route</button>
      </form>
      {submitted && <Map startPoint={startPoint} endPoint={endPoint} />}
    </div>
  );
}

export default Home;
