export const getLocationName = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();
      if (data.status === 'OK') {
        return data.results[0].formatted_address;
      } else {
        console.error(`Geocode API returned status: ${data.status}`);
        return `${lat}, ${lng}`;
      }
    } catch (error) {
      console.error(`Geocode API error: ${error}`);
      return `${lat}, ${lng}`;
    }
  };
  