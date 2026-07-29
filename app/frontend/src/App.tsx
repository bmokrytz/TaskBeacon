import Login from './pages/login/Login.tsx';
import Register from './pages/register/Register.tsx';
import Dashboard from './pages/dashboard/Dashboard.tsx';
import AddTask from './pages/addtask/AddTask.tsx';
import UpdateTask from './pages/updatetask/UpdateTask.tsx';
import { Routes, Route } from 'react-router';
import { useState, useEffect } from 'react';
import type { User } from './lib/types/index';
import { UserContext, TitleContext } from './context.tsx';

function App() {
  const [title, setTitle] = useState<string>("Task Beacon");
  const [user, setUser] = useState<User | null>(() => {
    const id = localStorage.getItem("id");
    const email = localStorage.getItem("email");
    const token = localStorage.getItem("token");

    if (id && email && token) {
      return { id, email, token }
    }

    return null;
  });

  useEffect(() => {
    document.title = title;
  }, [title]);

  return (
    <TitleContext value={{setTitle}}>
      <UserContext value={{user, setUser}}>
        <Routes>
          <Route path="/" element={<Login/>} />
          <Route path="register" element={<Register/>} />
          <Route path="dashboard" element={<Dashboard/>} />
          <Route path="tasks/new" element={<AddTask/>} />
          <Route path="tasks/:task_id/edit" element={<UpdateTask/>} />
        </Routes>
      </UserContext>
    </TitleContext>
  )
}

export default App
