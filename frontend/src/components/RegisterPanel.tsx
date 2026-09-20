import { useNavigate } from "react-router"; 
import { useState, useEffect } from "react";
import { login, register } from "@/lib/api/auth";
import { ValidationError } from "@/lib/utils/validate";

export default function RegisterPanel({onSuccess}: { onSuccess: () => void}) {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState<string>("");
    const [showEmailRequired, setShowEmailRequired] = useState<boolean>(false);
    const [showEmailInvalid, setShowEmailInvalid] = useState<boolean>(false);
    const [showPasswordRequirements, setShowPasswordRequirements] = useState<boolean>(false);
    const [showPasswordsDoNotMatch, setShowPasswordsDoNotMatch] = useState<boolean>(false);
    const [showConflict, setShowConflict] = useState<boolean>(false);
    const [showRegistrationFailure, setShowRegistrationFailure] = useState<boolean>(false);

    const navigate = useNavigate();
    const fieldBoxClassName = "flex flex-col mb-4 w-4/5";
    const labelClassName = "text-black font-semibold mb-3";
    const textInputClassName = "border border-gray-300 p-2 mb-2 rounded-lg w-full";
    const textErrorInputClassName = "border border-red-300 p-2 mb-2 rounded-lg w-full";
    const errorAsteriskClassName = "ml-2 text-red-500";
    const minPasswordChars = 8;
    const maxPasswordChars = 128;

    useEffect(() => {
        const emailInput = document.getElementById("email");
        if (emailInput) emailInput.focus();
    }, []);

    async function handleSubmit() {
        resetEmailErrors();
        resetPasswordErrors();
        try {
            const isRegistered = await register(email, password, confirmPassword);
            if (isRegistered) {
                const result = await login(email, password);
                if (result) {
                    onSuccess();
                } else {
                    navigate('/');
                }
            } else {
                setShowRegistrationFailure(true);
            }
        } catch(error) {
            if (error instanceof ValidationError) {
                if (error.message === "Conflict") {
                    setShowConflict(true);
                } else if (error.message === "No email and invalid password") {
                    setShowEmailRequired(true);
                    setShowPasswordRequirements(true);
                } else if (error.message === "Invalid email and invalid password") {
                    setShowEmailInvalid(true);
                    setShowPasswordRequirements(true);
                } else if (error.message === "No email") {
                    setShowEmailRequired(true);
                } else if (error.message === "Invalid email") {
                    setShowEmailInvalid(true);
                } else if (error.message === "Invalid password") {
                    setShowPasswordRequirements(true);
                } else if (error.message === "Passwords do not match") {
                    setShowPasswordsDoNotMatch(true);
                }
            } else {
                console.log("Error while registering user: ", error);
            }
        }
    }

    function resetEmailErrors() {
        if (showEmailRequired) setShowEmailRequired(false);
        if (showEmailInvalid) setShowEmailInvalid(false);
        if (showConflict) setShowConflict(false);
        if (showRegistrationFailure) setShowRegistrationFailure(false);
    }

    function resetPasswordErrors() {
        if (showPasswordRequirements) setShowPasswordRequirements(false);
        if (showPasswordsDoNotMatch) setShowPasswordsDoNotMatch(false);
        if (showConflict) setShowConflict(false);
        if (showRegistrationFailure) setShowRegistrationFailure(false);
    }

    return (
        <div className="flex flex-row flex-1 items-center justify-center">
            <div className="bg-white w-auto min-w-150 h-auto min-h-100 p-10 flex flex-col rounded-2xl shadow-gray-300 shadow-[0_0_20px_var(--tw-shadow-color)] border border-gray-300">
                <form className="flex flex-col gap-3" onSubmit={(e) => {
                                e.preventDefault();
                                handleSubmit();
                            }}>
                    <div className="flex items-center justify-center mb-6">
                        <h1 className="text-4xl font-bold text-black">Create an Account</h1>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className={fieldBoxClassName}>
                            <label htmlFor="email" className={labelClassName}>
                                Email:<span data-testid="email-error-asterisk" className={(showEmailRequired || showEmailInvalid || showConflict) ? errorAsteriskClassName : 'hidden'}>*</span>
                            </label>
                            <div className="relative">
                                <input
                                    id="email"
                                    type="text"
                                    placeholder="you@example.com"
                                    className={(showEmailRequired || showEmailInvalid || showConflict) ? textErrorInputClassName : textInputClassName}
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        resetEmailErrors();
                                    }}
                                />
                                {showEmailRequired && (
                                    <div className="absolute mr-4 z-10 right-full ml-5 -translate-y-12 bg-white border border-gray-300 rounded-lg shadow-md p-3 text-sm text-gray-700 w-64">
                                        {/* Pointer Arrow */}
                                        <div className="absolute top-1/4 -right-1.5 -translate-y-1/2 w-3 h-3 bg-white border-r border-t border-gray-300 rotate-45"></div>
                                        <p className="font-semibold mb-1">An email address is required to create an account.</p>
                                    </div>
                                )}
                                {showEmailInvalid && (
                                    <div className="absolute mr-4 z-10 right-full ml-5 -translate-y-12 bg-white border border-gray-300 rounded-lg shadow-md p-3 text-sm text-gray-700 w-64">
                                        {/* Pointer Arrow */}
                                        <div className="absolute top-1/4 -right-1.5 -translate-y-1/2 w-3 h-3 bg-white border-r border-t border-gray-300 rotate-45"></div>
                                        <p className="font-semibold mb-1">Use a valid email format. Example: user@example.com</p>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className={fieldBoxClassName}>
                            <label htmlFor="password" className={labelClassName}>
                                Password:<span data-testid="password-error-asterisk" className={(showPasswordRequirements || showPasswordsDoNotMatch) ? errorAsteriskClassName : 'hidden'}>*</span>
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••••••••••"
                                    className={(showPasswordRequirements || showPasswordsDoNotMatch) ? textErrorInputClassName : textInputClassName}  
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        resetPasswordErrors();
                                    }}
                                />
                                {showPasswordRequirements && (
                                    <div className="absolute z-10 left-full ml-5 -translate-y-12 bg-white border border-gray-300 rounded-lg shadow-md p-3 text-sm text-gray-700 w-64">
                                        {/* Pointer Arrow */}
                                        <div className="absolute top-1/8 -left-1.5 -translate-y-1/2 w-3 h-3 bg-white border-l border-b border-gray-300 rotate-45"></div>
                                        <p className="font-semibold mb-1">Password must contain:</p>
                                        <ul className="list-disc list-inside">
                                            <li>{minPasswordChars}–{maxPasswordChars} characters</li>
                                            <li>One uppercase letter</li>
                                            <li>One lowercase letter</li>
                                            <li>One digit</li>
                                            <li>One special character</li>
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className={fieldBoxClassName}>
                            <label htmlFor="confirmPassword" className={labelClassName}>
                                Confirm Password:<span data-testid="confirm-password-error-asterisk" className={(showPasswordRequirements || showPasswordsDoNotMatch) ? 'ml-2 text-red-500' : 'hidden'}>*</span>
                            </label>
                            <div className="relative">
                                <input
                                    id="confirmPassword"
                                    data-testid="confirmPassword-input"
                                    type="password"
                                    placeholder="••••••••••••••••"
                                    alt="Password confirmation text field"
                                    className={(showPasswordRequirements || showPasswordsDoNotMatch) ? textErrorInputClassName : textInputClassName}  
                                    value={confirmPassword}
                                    onChange={(e) => {
                                        setConfirmPassword(e.target.value);
                                        resetPasswordErrors();
                                    }}
                                />
                                {showPasswordsDoNotMatch && (
                                    <div className="absolute mr-4 z-10 right-full ml-5 -translate-y-12 bg-white border border-gray-300 rounded-lg shadow-md p-3 text-sm text-gray-700 w-64">
                                        {/* Pointer Arrow */}
                                        <div className="absolute top-1/3 -right-1.5 -translate-y-1/2 w-3 h-3 bg-white border-r border-t border-gray-300 rotate-45"></div>
                                        <p data-testid="passwords-do-not-match-message" className="font-semibold mb-1">The passwords do not match.</p>
                                    </div>
                                )}
                                {showConflict && (
                                    <div className="absolute z-10 top-full-translate-y-12 mt-3 bg-red-100 border border-red-800 rounded-lg p-2 text-sm text-gray-700">
                                        {/* Pointer Arrow */}
                                        <p className="font-semibold mb-1">The email provided is already associated</p>
                                        <p className="font-semibold mb-1">with an account.</p>
                                    </div>
                                )}
                                {showRegistrationFailure && (
                                    <div className="absolute z-10 top-full-translate-y-12 mt-3 bg-red-100 border border-red-800 rounded-lg p-2 text-sm text-gray-700">
                                        {/* Pointer Arrow */}
                                        <p data-testid="registration-failure-message" className="font-semibold mb-1">
                                            An error occurred while trying to register
                                        </p>
                                        <p className="font-semibold mb-1">
                                            your account. Please try again later.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center justify-end">
                        <button
                            type="submit"
                            className="bg-button-primary hover:bg-button-hover hover:cursor-pointer text-white text-xl mr-8 font-semibold px-4 py-2 mt-3 rounded-lg"
                        >Register</button>
                    </div>
                    <p className="pt-5 text-center text-gray-600">
                        Already have an account? <a data-testid="sign-in-link" onClick={() => navigate("/")} className="pl-1 text-button-primary font-bold hover:text-button-hover hover:cursor-pointer">Sign in</a>
                    </p>
                </form>
            </div>
        </div>
    );
}