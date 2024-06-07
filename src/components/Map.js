import React, { useEffect, useState } from 'react';
import { GoogleMap, DirectionsRenderer } from '@react-google-maps/api';
import { getSunPosition } from '../services/sunPosition';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend);

const containerStyle = {
  width: '100vw',
  height: '50vh'
};

const center = {
  lat: -3.745,
  lng: -38.523
};

function Map({ startPoint, endPoint, selectedTime, useCurrentTime }) {
  const [directions, setDirections] = useState(null);
  const [sunAnalytics, setSunAnalytics] = useState(null);
  const [error, setError] = useState('');
  const [showVisual, setShowVisual] = useState(false);

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
    let totalTimeInSun = 0;

    legs.forEach((leg) => {
      const steps = leg.steps;
      steps.forEach((step, index) => {
        const { lat, lng } = step.start_location;
        const sunPosition = getSunPosition(time, lat(), lng());
        console.log(`Step ${index + 1}: Sun Altitude - ${sunPosition.altitude}, Sun Azimuth - ${sunPosition.azimuth}`);
        const segmentTime = step.duration.value / 60; // Convert to minutes

        if (sunPosition.altitude < 0) {
          console.log(`Skipping segment with negative altitude: ${sunPosition.altitude}`);
          return; // Skip segments where the sun is below the horizon
        }

        // Determine the side based on azimuth and direction of the segment
        let side;
        const nextStep = steps[index + 1];
        if (nextStep) {
          const nextLatLng = nextStep.end_location;
          const heading = calculateHeading(lat(), lng(), nextLatLng.lat(), nextLatLng.lng());
          side = determineSideBasedOnHeadingAndSun(heading, sunPosition.azimuth);
        } else {
          side = sunPosition.azimuth > 0 && sunPosition.azimuth < 180 ? 'right' : 'left';
        }

        if (side === 'right') {
          totalTimeInShade += segmentTime;
        } else {
          totalTimeInSun += segmentTime;
        }

        analytics.push({
          start: step.start_location,
          end: step.end_location,
          altitude: sunPosition.altitude ? sunPosition.altitude.toFixed(2) : 'N/A',
          azimuth: sunPosition.azimuth ? sunPosition.azimuth.toFixed(2) : 'N/A',
          side,
          segmentTime
        });
      });
    });

    console.log(`Total time in shade: ${totalTimeInShade} minutes`);
    console.log(`Total time in sun: ${totalTimeInSun} minutes`);

    setSunAnalytics({ analytics, totalTimeInShade, totalTimeInSun });
  };

  const calculateHeading = (lat1, lng1, lat2, lng2) => {
    const dLon = (lng2 - lng1) * Math.PI / 180;
    const y = Math.sin(dLon) * Math.cos(lat2 * Math.PI / 180);
    const x = Math.cos(lat1 * Math.PI / 180) * Math.sin(lat2 * Math.PI / 180) - Math.sin(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.cos(dLon);
    const heading = Math.atan2(y, x) * 180 / Math.PI;
    return (heading + 360) % 360;
  };

  const determineSideBasedOnHeadingAndSun = (heading, sunAzimuth) => {
    const relativeAzimuth = (sunAzimuth - heading + 360) % 360;
    if (relativeAzimuth > 0 && relativeAzimuth < 180) {
      return 'right';
    } else {
      return 'left';
    }
  };

  const toggleVisual = () => {
    setShowVisual(!showVisual);
  };

  const chartData = sunAnalytics ? {
    labels: ['Time in Shade', 'Time in Sun'],
    datasets: [
      {
        label: 'Minutes',
        data: [sunAnalytics.totalTimeInShade, sunAnalytics.totalTimeInSun],
        backgroundColor: ['#4caf50', '#f44336']
      }
    ]
  } : null;

  const sunPositionData = sunAnalytics ? {
    labels: sunAnalytics.analytics.map((data, index) => `Segment ${index + 1}`),
    datasets: [
      {
        label: 'Sun Altitude (°)',
        data: sunAnalytics.analytics.map(data => parseFloat(data.altitude)),
        fill: false,
        borderColor: '#42A5F5',
        tension: 0.1
      },
      {
        label: 'Sun Azimuth (°)',
        data: sunAnalytics.analytics.map(data => parseFloat(data.azimuth)),
        fill: false,
        borderColor: '#FFA726',
        tension: 0.1
      }
    ]
  } : null;

  const pieData = sunAnalytics ? {
    labels: ['Time in Shade', 'Time in Sun'],
    datasets: [
      {
        data: [sunAnalytics.totalTimeInShade, sunAnalytics.totalTimeInSun],
        backgroundColor: ['#4caf50', '#f44336']
      }
    ]
  } : null;

  return (
    <div>
      <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={10}>
        {directions && <DirectionsRenderer directions={directions} />}
      </GoogleMap>
      <button className="toggle-button" onClick={toggleVisual}>
        {showVisual ? 'Show Text Data' : 'Show Visual Data'}
      </button>
      {showVisual ? (
        sunAnalytics && (
          <div className="chart-container">
            <Bar data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
            <Line data={sunPositionData} options={{ responsive: true, maintainAspectRatio: false }} />
            <Pie data={pieData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        )
      ) : (
        sunAnalytics && (
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
            <p>Total duration: {(sunAnalytics.totalTimeInShade + sunAnalytics.totalTimeInSun).toFixed(2)} minutes</p>
            <p>Time spent in shade: {sunAnalytics.totalTimeInShade.toFixed(2)} minutes</p>
            <p>Time spent in sun: {sunAnalytics.totalTimeInSun.toFixed(2)} minutes</p>
          </div>
        )
      )}
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </div>
  );
}

export default Map;
