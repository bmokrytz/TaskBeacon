import { useNavigate } from "react-router"; 
import { useEffect, useState } from "react";

export default function Header() {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('token_type');
    localStorage.removeItem('user-email');
    localStorage.removeItem('user-log-in-time');
    navigate('/');
  }

  return (
    <header className="bg-white border-b-gray-800 border-b py-5 px-10 flex items-center justify-between">
      <p className="text-2xl text-black font-bold">Task Beacon</p>
      <div className="flex flex-row gap-40 items-center">
        {localStorage.getItem("user-email") && (<UserPanel/>)}
        <button 
          className="bg-button-primary hover:bg-button-hover hover:cursor-pointer text-white text-md px-4 py-2 rounded-xl"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
        
    </header>
  )
}

function UserPanel() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    setEmail(localStorage.getItem("user-email"))
  }, []);

  return (
    <div className="flex flex-row gap-2">
      <p className="text-lg">{email}</p>
    </div>
  )
}