import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import RoomContainer from './components/RoomContainer';

// Simple component to generate a random room and redirect
const HomeRedirect = () => {
    const randomRoomId = uuidv4().slice(0, 8); // Short UUID
    return <Navigate to={`/home/${randomRoomId}`} replace />;
};

function App() {
  return (
    <Router>
        <Routes>
            {/* Redirect root to a random room */}
            <Route path="/" element={<HomeRedirect />} />
            {/* The main application route */}
            <Route path="/home/:roomId" element={<RoomContainer />} />
        </Routes>
    </Router>
  );
}

export default App;