import Landing from '@/pages/Landing';
import Dashboard from '@/pages/Dashboard';
import { Routes, Route } from 'react-router';


function App() {

  return (
    <>
      <Routes>
        <Route path="/" element={<Landing  />} />
        <Route path="/dashboard" element={<Dashboard  />} />
      </Routes>
    </>
  )
}

export default App
