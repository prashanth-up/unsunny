import React, { useEffect, useState } from 'react';
import { GoogleMap, DirectionsRenderer } from '@react-google-maps/api';
import { getSunPosition } from '../services/sunPosition';

const containerStyle = {
  width: '100%',
  height: '400px'
};

const center = {
  lat: -3.745,
  lng: -38.523
};

function Map({ startPoint, endPoint, selectedTime, useCurrentTime }) {
  const [directions, setDirections] = useState(null);
  const [sunAnalytics, setSunAnalytics] = useState([]);
  const [error, setError] = useState('');

  const geocode = async (address) => {
    return new Promise((resolve, reject) => {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address }, (results, status) => {
        if (status === window.google.maps.GeocoderStatus.OK) {
          resolve(results[0].geometry.location);
        } else {
          reject(`Geocode was not successful for the following reason: ${status}`);
        }
      });
    });
  };

  const fetchRoute = async () => {
    try {
      const startLocation = await geocode(startPoint);
      const endLocation = await geocode(endPoint);
      const directionsService = new window.google.maps.DirectionsService();

      directionsService.route(
        {
          origin: startLocation,
          destination: endLocation,
          travelMode: window.google.maps.TravelMode.DRIVING
        },
        (result, status) => {
          if (status === window.google.maps.DirectionsStatus.OK) {
            setDirections(result);
            calculateSunAnalytics(result.routes[0]);
          } else {
            setError(`Error fetching directions: ${status}`);
          }
        }
      );
    } catch (error) {
      setError(error);
    }
  };

  useEffect(() => {
    if (startPoint && endPoint) {
      fetchRoute();
    }
  }, [startPoint, endPoint]);

  const calculateSunAnalytics = (route) => {
    const legs = route.legs;
    let analytics = [];
    const time = useCurrentTime ? new Date() : new Date(selectedTime);
    let totalTimeInShade = 0;

    legs.forEach((leg) => {
      const steps = leg.steps;
      steps.forEach((step) => {
        const { lat, lng } = step.start_location;
        const sunPosition = getSunPosition(time, lat(), lng());
        const side = sunPosition.azimuth > 0 ? 'right' : 'left';
        const segmentTime = step.duration.value / 60; // Convert to minutes
        totalTimeInShade += segmentTime;

        analytics.push({
          start: step.start_location,
          end: step.end_location,
          altitude: sunPosition.altitude.toFixed(2),
          azimuth: sunPosition.azimuth.toFixed(2),
          side,
          segmentTime
        });
      });
    });

    const totalDuration = legs.reduce((acc, leg) => acc + leg.duration.value, 0) / 60; // Convert to minutes
    const timeSaved = totalDuration - totalTimeInShade;

    setSunAnalytics({ analytics, totalDuration, timeSaved });
  };

  return (
    <div>
      <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={10}>
        {directions && <DirectionsRenderer directions={directions} />}
      </GoogleMap>
      {sunAnalytics.analytics && (
        <div className="analytics-container">
          <h2>Sun Analytics</h2>
          <ul>
            {sunAnalytics.analytics.map((data, index) => (
              <li key={index}>
                <p>
                  Segment from ({data.start.lat()}, {data.start.lng()}) to ({data.end.lat()}, {data.end.lng()}):
                  Sun Altitude - {data.altitude}°, Sun Azimuth - {data.azimuth}°. Sit on the {data.side} side for maximum shade.
                </p>
              </li>
            ))}
          </ul>
          <p>Total duration: {sunAnalytics.totalDuration.toFixed(2)} minutes</p>
          <p>Time saved by sitting in the shade: {sunAnalytics.timeSaved.toFixed(2)} minutes</p>
        </div>
      )}
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </div>
  );
}

export default Map;
