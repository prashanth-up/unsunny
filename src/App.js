import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import GoogleMapsLoader from './GoogleMapsLoader';
import './App.css'; // Ensure you have imported your CSS file

function App() {
  return (
    <GoogleMapsLoader>
      <Router>
        <div className="app-container">
          <header className="header">
            <h1>UnSunny</h1>
          </header>
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
            </Routes>
          </main>
          <footer className="footer">
            <p>&copy; 2024 UnSunny. All rights reserved.</p>
          </footer>
        </div>
      </Router>
    </GoogleMapsLoader>
  );
}

export default App;
