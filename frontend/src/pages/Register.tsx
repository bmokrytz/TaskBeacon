import { useState } from 'react';
import { useNavigate } from "react-router";
import RegisterPanel from "@/components/RegisterPanel";

export default function Register() {
    const [success, setSuccess] = useState<boolean>(false);

    function handleRegisterSuccess(): void {
        setSuccess(true);
    }

    return (
            <div className="flex flex-col h-full bg-gray-100">
                {success ? <RegistrationSuccess /> : <RegisterPanel onSuccess={handleRegisterSuccess} />}
            </div>
        );
}

function RegistrationSuccess() {
    const navigate = useNavigate();

    return (
        <div className="flex flex-row flex-1 items-center justify-center">
            <div className="bg-white w-auto min-w-120 h-auto min-h-80 p-10 flex flex-col rounded-2xl shadow-gray-300 shadow-[0_0_20px_var(--tw-shadow-color)] border border-gray-300">
                <div className="flex flex-col flex-1 items-center justify-center">
                    <h1 className="text-2xl mb-10 text-black font-semibold">Account created. Welcome to Task Beacon!</h1>
                    <button 
                        onClick={() => {navigate('/dashboard');}}
                        className="rounded-lg bg-button-primary hover:bg-button-hover text-white w-max self-center p-2">
                        Go to Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
}