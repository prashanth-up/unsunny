import React, { useEffect, useState } from 'react';
import { GoogleMap, DirectionsRenderer, Autocomplete } from '@react-google-maps/api';
import { getSunPosition } from '../services/sunPosition';
import { getLocationName } from '../services/geocode';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import './Map.css'; // Import the new CSS file

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend);

const containerStyle = {
  width: '100vw',
  height: '50vh',
};

const center = {
  lat: 39.9612, // Latitude for Columbus, Ohio
  lng: -82.9988, // Longitude for Columbus, Ohio
};

function Map({ startPoint, endPoint, selectedTime, useCurrentTime }) {
  const [directions, setDirections] = useState(null);
  const [sunAnalytics, setSunAnalytics] = useState(null);
  const [error, setError] = useState('');
  const [showVisual, setShowVisual] = useState(false);
  const [locationNames, setLocationNames] = useState({});

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
          travelMode: window.google.maps.TravelMode.DRIVING,
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
  }, [startPoint, endPoint, selectedTime]);

  const calculateSunAnalytics = async (route) => {
    const legs = route.legs;
    let analytics = [];
    const time = useCurrentTime ? new Date() : new Date(selectedTime);
    let totalTimeInShade = 0;
    let totalTimeInSun = 0;
    let sunBelowHorizon = true;

    for (let leg of legs) {
      for (let step of leg.steps) {
        const lat = step.start_location.lat();
        const lng = step.start_location.lng();
        const sunPosition = getSunPosition(time, lat, lng);

        if (isNaN(sunPosition.altitude) || isNaN(sunPosition.azimuth)) {
          continue;
        }

        const segmentTime = step.duration.value / 60;

        if (sunPosition.altitude < 0) {
          continue;
        }

        sunBelowHorizon = false;

        let side;
        const nextStep = step.end_location;
        const heading = calculateHeading(lat, lng, nextStep.lat(), nextStep.lng());
        side = determineSideBasedOnHeadingAndSun(heading, sunPosition.azimuth);

        if (side === 'right') {
          totalTimeInShade += segmentTime;
        } else {
          totalTimeInSun += segmentTime;
        }

        const startLocationName = await getLocationName(lat, lng);
        const endLocationName = await getLocationName(nextStep.lat(), nextStep.lng());

        setLocationNames((prev) => ({
          ...prev,
          [`${lat},${lng}`]: startLocationName,
          [`${nextStep.lat()},${nextStep.lng()}`]: endLocationName,
        }));

        analytics.push({
          start: { lat: lat, lng: lng },
          end: { lat: nextStep.lat(), lng: nextStep.lng() },
          startName: startLocationName,
          endName: endLocationName,
          altitude: sunPosition.altitude ? sunPosition.altitude.toFixed(2) : 'N/A',
          azimuth: sunPosition.azimuth ? sunPosition.azimuth.toFixed(2) : 'N/A',
          side,
          segmentTime,
        });
      }
    }

    if (sunBelowHorizon) {
      setSunAnalytics(null);
      setError('The sun is below the horizon at this time. Please select a different time.');
    } else {
      setSunAnalytics({ analytics, totalTimeInShade, totalTimeInSun });
      setError('');
    }
  };

  const calculateHeading = (lat1, lng1, lat2, lng2) => {
    const dLon = (lng2 - lng1) * Math.PI / 180;
    const y = Math.sin(dLon) * Math.cos(lat2 * Math.PI / 180);
    const x =
      Math.cos(lat1 * Math.PI / 180) * Math.sin(lat2 * Math.PI / 180) -
      Math.sin(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.cos(dLon);
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

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 2,
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart',
    },
  };

  const chartData = sunAnalytics
    ? {
        labels: ['Time in Shade', 'Time in Sun'],
        datasets: [
          {
            label: 'Minutes',
            data: [sunAnalytics.totalTimeInShade, sunAnalytics.totalTimeInSun],
            backgroundColor: ['#4caf50', '#f44336'],
          },
        ],
      }
    : null;

  const sunPositionData = sunAnalytics
    ? {
        labels: sunAnalytics.analytics.map((data, index) => `Segment ${index + 1}`),
        datasets: [
          {
            label: 'Sun Altitude (°)',
            data: sunAnalytics.analytics.map((data) => parseFloat(data.altitude)),
            fill: false,
            borderColor: '#42A5F5',
            tension: 0.1,
          },
          {
            label: 'Sun Azimuth (°)',
            data: sunAnalytics.analytics.map((data) => parseFloat(data.azimuth)),
            fill: false,
            borderColor: '#FFA726',
            tension: 0.1,
          },
        ],
      }
    : null;

  const pieData = sunAnalytics
    ? {
        labels: ['Time in Shade', 'Time in Sun'],
        datasets: [
          {
            data: [sunAnalytics.totalTimeInShade, sunAnalytics.totalTimeInSun],
            backgroundColor: ['#4caf50', '#f44336'],
          },
        ],
      }
    : null;

  return (
    <div className="home-container">
      <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={10}>
        {directions && <DirectionsRenderer directions={directions} />}
      </GoogleMap>
      <button className="toggle-button" onClick={toggleVisual}>
        {showVisual ? 'Show Text Data' : 'Show Visual Data'}
      </button>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {showVisual ? (
        sunAnalytics && (
          <div className="charts-container">
            <div className="chart-item">
              <Bar data={chartData} options={chartOptions} />
              <p className="chart-description">Time spent in shade vs. time spent in sun.</p>
            </div>
            <div className="chart-item">
              <Line data={sunPositionData} options={chartOptions} />
              <p className="chart-description">Sun altitude and azimuth over the course of the trip.</p>
            </div>
            <div className="chart-item">
              <Pie data={pieData} options={chartOptions} />
              <p className="chart-description">Proportion of time spent in shade vs. sun.</p>
            </div>
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
                    Segment from {data.startName} to {data.endName}: Sun Altitude - {data.altitude}°, Sun Azimuth -{' '}
                    {data.azimuth}°. Sit on the {data.side} side for maximum shade.
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
    </div>
  );
}

export default Map;
