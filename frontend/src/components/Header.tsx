import { useEffect, useState } from "react";

import { logout } from '@/lib/services/authService';

export default function Header() {

  return (
    <header className="bg-white border-b-gray-800 border-b py-5 px-10 flex items-center justify-between">
      <p className="text-2xl text-black font-bold">Task Beacon</p>
      <div className="flex flex-row gap-40 items-center">
        {localStorage.getItem("user-email") && (<UserPanel/>)}
        <button 
          className="bg-button-primary hover:bg-button-hover hover:cursor-pointer text-white text-md px-4 py-2 rounded-xl"
          onClick={logout}
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