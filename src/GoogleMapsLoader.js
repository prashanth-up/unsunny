import React from 'react';
import { useJsApiLoader } from '@react-google-maps/api';

const libraries = ['places'];

const GoogleMapsLoader = ({ children }) => {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY, // Ensure your API key is correct
    libraries,
  });

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  if (loadError) {
    return <div>Error loading Google Maps API</div>;
  }

  return <>{children}</>;
};

export default GoogleMapsLoader;
