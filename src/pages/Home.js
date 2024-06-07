import React, { useState, useRef } from 'react';
import { Autocomplete } from '@react-google-maps/api';
import Map from '../components/Map';
import './Home.css';

function Home() {
  const [startPoint, setStartPoint] = useState('');
  const [endPoint, setEndPoint] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [useCurrentTime, setUseCurrentTime] = useState(true);
  const [selectedTime, setSelectedTime] = useState(new Date().toISOString().slice(0, 16));

  const startRef = useRef();
  const endRef = useRef();

  const handleSubmit = (e) => {
    e.preventDefault();
    setStartPoint(startRef.current.value);
    setEndPoint(endRef.current.value);
    setSubmitted(true);
  };

  return (
    <div className="home-container">
      <h1>Welcome to UnSunny</h1>
      <p>Find the optimal route for maximum shade.</p>
      <form onSubmit={handleSubmit} className="form-container">
        <div className="input-container">
          <label>Start Point:</label>
          <Autocomplete>
            <input
              type="text"
              placeholder="Enter start location"
              ref={startRef}
              id="start-point"
            />
          </Autocomplete>
        </div>
        <div className="input-container">
          <label>End Point:</label>
          <Autocomplete>
            <input
              type="text"
              placeholder="Enter end location"
              ref={endRef}
              id="end-point"
            />
          </Autocomplete>
        </div>
        <div className="input-container">
          <label>
            <input
              type="radio"
              checked={useCurrentTime}
              onChange={() => setUseCurrentTime(true)}
            />
            Use Current Time
          </label>
          <label>
            <input
              type="radio"
              checked={!useCurrentTime}
              onChange={() => setUseCurrentTime(false)}
            />
            Select Time
          </label>
        </div>
        {!useCurrentTime && (
          <div className="input-container">
            <label>Choose Time:</label>
            <input
              type="datetime-local"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
            />
          </div>
        )}
        <button type="submit" className="submit-button">Find Route</button>
      </form>
      {submitted && <Map startPoint={startPoint} endPoint={endPoint} selectedTime={selectedTime} useCurrentTime={useCurrentTime} />}
    </div>
  );
}

export default Home;
