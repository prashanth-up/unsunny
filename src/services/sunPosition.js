import SunCalc from 'suncalc';

export const getSunPosition = (date, lat, lng) => {
  console.log(`Calculating Sun Position for date: ${date}, lat: ${lat}, lng: ${lng}`);
  const sunPosition = SunCalc.getPosition(date, lat, lng);
  if (!sunPosition) {
    console.error(`SunCalc returned undefined for date: ${date}, lat: ${lat}, lng: ${lng}`);
    return { altitude: NaN, azimuth: NaN };
  }
  return {
    altitude: sunPosition.altitude * (180 / Math.PI), // Convert from radians to degrees
    azimuth: sunPosition.azimuth * (180 / Math.PI) // Convert from radians to degrees
  };
};
