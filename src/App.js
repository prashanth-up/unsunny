import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import GoogleMapsLoader from './GoogleMapsLoader';
import GuideModal from './components/GuideModal';
import './App.css'; // Ensure you have imported your CSS file

function App() {
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  const openGuide = () => {
    setIsGuideOpen(true);
  };

  const closeGuide = () => {
    setIsGuideOpen(false);
  };

  return (
    <GoogleMapsLoader>
      <Router basename="/unsunny">
        <div className="app-container">
          <header className="header">
            <h1>UnSunny</h1>
            <button className="guide-button" onClick={openGuide}>
              How to Use
            </button>
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
          <GuideModal isOpen={isGuideOpen} onClose={closeGuide} />
        </div>
      </Router>
    </GoogleMapsLoader>
  );
}

export default App;
