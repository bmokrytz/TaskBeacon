import Landing from '@/pages/Landing';
import Register from '@/pages/Register';
import Dashboard from '@/pages/Dashboard';
import { Routes, Route } from 'react-router';
import CreateTask from './pages/CreateTask';


function App() {

  return (
    <>
      <Routes>
        <Route path="/" element={<Landing  />} />
        <Route path="/dashboard" element={<Dashboard  />} />
        <Route path="/register" element={<Register />} />
        <Route path="/create" element={<CreateTask />} />
      </Routes>
    </>
  )
}

export default App
