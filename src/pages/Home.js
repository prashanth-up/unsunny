import React, { useState } from 'react';
import Map from '../components/Map';

function Home() {
  const [startPoint, setStartPoint] = useState('');
  const [endPoint, setEndPoint] = useState('');
  const [role, setRole] = useState('driver');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission (e.g., calculate routes, sun position, etc.)
    console.log('Start Point:', startPoint);
    console.log('End Point:', endPoint);
    console.log('Role:', role);
  };

  return (
    <div>
      <h1>Welcome to UnSunny</h1>
      <p>Find the optimal route for maximum shade.</p>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Start Point:</label>
          <input
            type="text"
            value={startPoint}
            onChange={(e) => setStartPoint(e.target.value)}
            placeholder="Enter start location"
          />
        </div>
        <div>
          <label>End Point:</label>
          <input
            type="text"
            value={endPoint}
            onChange={(e) => setEndPoint(e.target.value)}
            placeholder="Enter end location"
          />
        </div>
        <div>
          <label>Role:</label>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="driver">Driver</option>
            <option value="passenger">Passenger</option>
          </select>
        </div>
        <button type="submit">Find Route</button>
      </form>
      <Map />
    </div>
  );
}

export default Home;
