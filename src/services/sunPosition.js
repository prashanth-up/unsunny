import SunCalc from 'suncalc';

export function getSunPosition(date, latitude, longitude) {
  const sunPosition = SunCalc.getPosition(date, latitude, longitude);
  return {
    altitude: sunPosition.altitude * (180 / Math.PI), // Convert radians to degrees
    azimuth: sunPosition.azimuth * (180 / Math.PI) // Convert radians to degrees
  };
}
