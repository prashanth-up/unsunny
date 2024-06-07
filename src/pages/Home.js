import React, { useState } from 'react';
import { Autocomplete } from '@react-google-maps/api';
import Map from '../components/Map';
import './Home.css';


function Home() {
  const [startPoint, setStartPoint] = useState('');
  const [endPoint, setEndPoint] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [useCurrentTime, setUseCurrentTime] = useState(true);
  const [startAutocomplete, setStartAutocomplete] = useState(null);
  const [endAutocomplete, setEndAutocomplete] = useState(null);

  const onLoadStart = (autocomplete) => {
    setStartAutocomplete(autocomplete);
  };

  const onLoadEnd = (autocomplete) => {
    setEndAutocomplete(autocomplete);
  };

  const onPlaceChangedStart = () => {
    if (startAutocomplete) {
      const place = startAutocomplete.getPlace();
      setStartPoint(place.formatted_address || place.name);
    }
  };

  const onPlaceChangedEnd = () => {
    if (endAutocomplete) {
      const place = endAutocomplete.getPlace();
      setEndPoint(place.formatted_address || place.name);
    }
  };

  return (
    <div className="home-container">
      <div className="form-container">
        <div className="input-container">
          <label htmlFor="start-point"><i className="fas fa-map-marker-alt"></i> Start Point</label>
          <Autocomplete onLoad={onLoadStart} onPlaceChanged={onPlaceChangedStart}>
            <input
              type="text"
              id="start-point"
              className="input-box"
              value={startPoint}
              onChange={(e) => setStartPoint(e.target.value)}
            />
          </Autocomplete>
        </div>
        <div className="input-container">
          <label htmlFor="end-point"><i className="fas fa-map-marker-alt"></i> End Point</label>
          <Autocomplete onLoad={onLoadEnd} onPlaceChanged={onPlaceChangedEnd}>
            <input
              type="text"
              id="end-point"
              className="input-box"
              value={endPoint}
              onChange={(e) => setEndPoint(e.target.value)}
            />
          </Autocomplete>
        </div>
        <div className="input-container">
          <label htmlFor="selected-time"><i className="fas fa-clock"></i> Selected Time</label>
          <input
            type="datetime-local"
            id="selected-time"
            className="input-box"
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
            disabled={useCurrentTime}
          />
        </div>
        <div className="input-container">
          <input
            type="checkbox"
            id="use-current-time"
            checked={useCurrentTime}
            onChange={() => setUseCurrentTime(!useCurrentTime)}
          />
          <label htmlFor="use-current-time">Use Current Time</label>
        </div>
        <button className="submit-button" onClick={() => { /* Trigger route calculation */ }}>
          <i className="fas fa-search"></i> Submit
        </button>
      </div>
      <Map startPoint={startPoint} endPoint={endPoint} selectedTime={selectedTime} useCurrentTime={useCurrentTime} />
    </div>
  );
}

export default Home;
