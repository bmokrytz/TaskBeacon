import { Routes, Route } from 'react-router';
import { useEffect } from 'react';

import Landing from '@/pages/Landing';
import Register from '@/pages/Register';
import Dashboard from '@/pages/Dashboard';
import CreateTask from '@/pages/CreateTask';
import EditTask from '@/pages/EditTask';
import ProtectedRoute from './components/ProtectedRoute';
import { scheduleLogout } from './lib/services/authService';


function App() {

  useEffect(() => {
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        const expiryTime = Number(localStorage.getItem("expiry_time"));
        if (expiryTime) {
          scheduleLogout(expiryTime);
        }
      }
    })
  }, []);

  return (
    <>
      <Routes>
        <Route path="/" element={<Landing  />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard  /></ProtectedRoute>} />
        <Route path="/create" element={<ProtectedRoute><CreateTask /></ProtectedRoute>} />
        <Route path="/edit/:id" element={<ProtectedRoute><EditTask /></ProtectedRoute>} />
      </Routes>
    </>
  )
}

export default App
