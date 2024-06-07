import React, { useEffect, useState } from 'react';
import { GoogleMap, DirectionsService, DirectionsRenderer, Autocomplete } from '@react-google-maps/api';
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
  const [sunAnalytics, setSunAnalytics] = useState('');
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
    let analytics = '';
    const time = useCurrentTime ? new Date() : new Date(selectedTime);

    legs.forEach((leg) => {
      const steps = leg.steps;
      steps.forEach((step) => {
        const { lat, lng } = step.start_location;
        const sunPosition = getSunPosition(time, lat(), lng());
        analytics += `Segment from ${step.start_location} to ${step.end_location}: Sun Altitude - ${sunPosition.altitude.toFixed(2)}°, Sun Azimuth - ${sunPosition.azimuth.toFixed(2)}°. `;
        const side = sunPosition.azimuth > 0 ? 'right' : 'left';
        analytics += `Sit on the ${side} side for maximum shade. `;
      });
    });

    setSunAnalytics(analytics);
  };

  return (
    <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={10}>
      {directions && <DirectionsRenderer directions={directions} />}
      <div>
        <p>{sunAnalytics}</p>
      </div>
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </GoogleMap>
  );
}

export default Map;
