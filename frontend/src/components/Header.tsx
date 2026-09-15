import { useNavigate } from "react-router"; 

export default function Header() {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('token_type');
    navigate('/');
  }

  return (
    <header className="bg-white border-b-gray-800 border-b py-5 px-10 flex items-center justify-between">
      <p className="text-2xl text-black font-bold">Task Beacon</p>
      <button 
        className="bg-button-primary hover:bg-button-hover hover:cursor-pointer text-white text-md px-4 py-2 rounded-xl"
        onClick={handleLogout}
      >
        Logout
      </button>
    </header>
  )
}