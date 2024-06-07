import React, { useEffect, useState } from 'react';
import { GoogleMap, LoadScript } from '@react-google-maps/api';
import { getSunPosition } from '../services/sunPosition';

const containerStyle = {
  width: '100%',
  height: '400px'
};

const center = {
  lat: -3.745,
  lng: -38.523
};

function Map() {
  const [sunPosition, setSunPosition] = useState({});

  useEffect(() => {
    const date = new Date();
    const position = getSunPosition(date, center.lat, center.lng);
    setSunPosition(position);
  }, []);

  return (
    <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={10}
      >
        {/* Add markers or other map features */}
        <div>
          <p>Sun Altitude: {sunPosition.altitude}</p>
          <p>Sun Azimuth: {sunPosition.azimuth}</p>
        </div>
      </GoogleMap>
    </LoadScript>
  );
}

export default Map;
