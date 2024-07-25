import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Outlet } from 'react-router-dom';
import TwitchDetailsPage from './TwitchDetailsPage.js';
import './style.css';

function LaunchPage() {
    return (
        <div className="launchContainer">
            <h1>Welcome to Stream Insights</h1>

            <div className="iconButtons">
                <Link to="/twitch/details" className="iconLink">
<img src="/TwitchGlitchPurple.png" alt="Twitch Icon" width="60" height="60" />
                </Link>
            </div>
        </div>
    );
}

function TwitchPage() {
    return <div>Twitch Page</div>;
}

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LaunchPage />} />
                <Route path="/twitch" element={<TwitchPage />} />
                <Route path="/twitch/details" element={<TwitchDetailsPage />} />
            </Routes>
        </Router>
    );
}

export default App;
