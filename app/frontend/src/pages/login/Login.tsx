import { useNavigate } from 'react-router';
import { useState, useRef, useContext, useEffect } from 'react';
import { ErrorTextContext, UserContext, TitleContext } from '../../context';
import { showError } from '../../lib/utils/errors';
import { validateFormFields } from '../../lib/utils/validate';
import { login } from "../../lib/api/auth";
import { AuthInput } from '../../components';
import './Login.css';


function Login() {
    const [showErrorText, setShowErrorText] = useState<boolean>(false);
    const [errorText, setErrorText] = useState<string>("");
    const titleContext = useContext(TitleContext);

    useEffect(() => {
        titleContext.setTitle("Task Beacon - Login");
    }, [titleContext]);

    return (
        <div className="content-container">
            <ErrorTextContext value={{errorText, setErrorText, showErrorText, setShowErrorText}}>
                <LoginForm/>
            </ErrorTextContext>
        </div>
    );
}

export default Login;


function LoginForm() {
    const [password, setPassword] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const errorContext = useContext(ErrorTextContext);

    const emailInputRef = useRef<HTMLInputElement>(null);
    const submitButtonRef = useRef<HTMLButtonElement>(null);

    return (
        <div id="login-container">
            <div className="form-container">
                <h1>Task Beacon</h1>
                <form onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        e.preventDefault();
                        if (submitButtonRef.current) {
                            submitButtonRef.current.click();
                        }
                    }
                }}>
                    {errorContext.showErrorText ? <h2>{errorContext.errorText}</h2> : null}
                    <AuthInput label={"Email:"} ref={emailInputRef} inputType={"email"} name={"email"} callBack={setEmail}/>
                    <AuthInput label={"Password:"} inputType={"password"} name={"password"} callBack={setPassword}/>
                    <div className="submit-btn-container">
                        <SubmitButton ref={submitButtonRef} inputValues={{email, password}} />
                    </div>
                </form>
                <RegisterLink/>
            </div>
        </div>
    );
}

export type LoginFormInputValues = {
    email: string;
    password: string;
};

type SubmitButtonProps = {
    inputValues: LoginFormInputValues;
    ref?: React.RefObject<HTMLButtonElement | null>;
};

type SubmitState = "enabled" | "disabled";

function SubmitButton({
    inputValues,
    ref,
}: SubmitButtonProps) {
    const navigate = useNavigate();
    const [state, setState] = useState<SubmitState>("enabled");
    const [label, setLabel] = useState("Submit");
    const errorContext = useContext(ErrorTextContext);
    const userContext = useContext(UserContext);

    async function clickHandler() {
        setState("disabled");
        setLabel("Logging in...")
        const invalid = validateFormFields(inputValues);
        if (invalid) {
            showError(invalid, errorContext);
            setLabel("Submit");
            setState("enabled");
            return;
        }

        const user = await login(inputValues.email, inputValues.password);

        if (user) {
            userContext.setUser(user);
            localStorage.setItem("id", user.id);
            localStorage.setItem("email", user.email);
            localStorage.setItem("token", user.token);
            navigate("/dashboard");
            return;
        }

        showError("Login failed. Please check your email and password.", errorContext);
        setLabel("Submit")
        setState("enabled");
    }

    return (
        <div className="submit-container">
            <button className="submit-btn" ref={ref} type='button' disabled={state === 'disabled'} onClick={clickHandler}>{label}</button>
        </div>
    )
}

function RegisterLink() {
    const navigate = useNavigate();
    return (
        <div className="register-link-container">
            <span>Don't have an account? </span>
            <button className="register-link-btn" onClick={() => navigate("/register")}>Register</button>
        </div>
    );
}
