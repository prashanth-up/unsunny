import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import GoogleMapsLoader from './GoogleMapsLoader';

function App() {
  return (
    <GoogleMapsLoader>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </div>
      </Router>
    </GoogleMapsLoader>
  );
}

export default App;
