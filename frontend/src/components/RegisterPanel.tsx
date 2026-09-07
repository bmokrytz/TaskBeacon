import { useNavigate } from "react-router"; 
import { useState } from "react";

export default function RegisterPanel() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const navigate = useNavigate();
    const fieldBoxClassName = "flex flex-col mb-4 w-4/5";
    const labelClassName = "text-black font-semibold mb-3";
    const textInputClassName = "border border-gray-300 p-2 mb-2 rounded-lg";

    async function handleSubmit() {
        console.log('still need to implement.');
    }

    return (
        <div className="flex flex-row flex-1 items-center justify-center">
            <div className="bg-white w-auto min-w-150 h-auto min-h-100 p-10 flex flex-col rounded-2xl shadow-gray-300 shadow-[0_0_20px_var(--tw-shadow-color)] border border-gray-300">
                <form className="flex flex-col gap-3" onSubmit={(e) => {
                                e.preventDefault();
                                handleSubmit();
                            }}>
                    <div className="flex items-center justify-center mb-6">
                        <p className="text-4xl font-bold text-black">Create an Account</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className={fieldBoxClassName}>
                            <label className={labelClassName}>
                                Email:
                            </label>
                            <input
                                type="text"
                                placeholder="you@example.com"
                                className={textInputClassName}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className={fieldBoxClassName}>
                            <label className={labelClassName}>
                                Password:
                            </label>
                            <input
                                type="password"
                                placeholder="••••••••••••••••"
                                className={textInputClassName}  
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <div className={fieldBoxClassName}>
                            <label className={labelClassName}>
                                Confirm Password:
                            </label>
                            <input
                                type="password"
                                placeholder="••••••••••••••••"
                                className={textInputClassName}  
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="flex items-center justify-end">
                        <button
                            type="submit"
                            className="bg-button-primary hover:bg-button-hover hover:cursor-pointer text-white text-xl mr-8 font-semibold px-4 py-2 mt-3 rounded-lg"
                        >Register</button>
                    </div>
                    <p className="pt-5 text-center text-gray-600">
                        Already have an account? <a onClick={() => navigate("/")} className="pl-1 text-button-primary font-bold hover:text-button-hover">Sign in</a>
                    </p>
                </form>
            </div>
        </div>
    );
}