// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { SocketProvider } from './contexts/SocketContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import GlobalCafe from './pages/GlobalCafe';
import Profile from './pages/Profile';
import MeetupChat from './pages/MeetupChat';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SocketProvider>
          <Router>
            <div className="min-h-screen bg-base-100 bg-paper bg-noise">
              <Navbar />
              <main className="pt-16">
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/" element={
                    <ProtectedRoute>
                      <Home />
                    </ProtectedRoute>
                  } />
                  <Route path="/cafe" element={
                    <ProtectedRoute>
                      <GlobalCafe />
                    </ProtectedRoute>
                  } />
                  <Route path="/profile" element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  } />
                  <Route path="/meetup/:meetupId/chat" element={
                    <ProtectedRoute>
                      <MeetupChat />
                    </ProtectedRoute>
                  } />
                </Routes>
              </main>
              <Toaster 
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: 'var(--fallback-b2,oklch(var(--b2)))',
                    color: 'var(--fallback-bc,oklch(var(--bc)))',
                    border: '1px solid var(--fallback-b3,oklch(var(--b3)))'
                  }
                }}
              />
            </div>
          </Router>
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;