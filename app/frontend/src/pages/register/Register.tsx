import { useState, useEffect, useRef, useContext } from "react";
import { ErrorTextContext, TitleContext } from '../../context';
import { register } from '../../lib/api/auth';
import { AuthInput } from '../../components';
import { showError } from "../../lib/utils/errors";
import { validateFormFields } from "../../lib/utils/validate";
import './Register.css';
import { useNavigate } from "react-router";


type RegisterState = "register" | "success";

function Register() {
    const [state, setState] = useState<RegisterState>("register");
    const titleContext = useContext(TitleContext);

    useEffect(() => {
        titleContext.setTitle("Task Beacon - Register");
    }, [titleContext]);

    return (
        <div className="content-container">
            { state === "register" ? <RegisterForm setState={setState}/> : <RegisterSuccessMessage/> }
        </div>
    );
}

export default Register;

type RegisterFormProps = {
    setState: React.Dispatch<React.SetStateAction<RegisterState>>;
}

function RegisterForm({ setState }: RegisterFormProps) {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [password_conf, setPasswordConf] = useState<string>("");
    const [showErrorText, setShowErrorText] = useState<boolean>(false);
    const [errorText, setErrorText] = useState<string>("");

    const emailInputRef = useRef<HTMLInputElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    const inputValues: RegisterFormInputValues = {email, password, password_conf};

    useEffect(() => {
        if (emailInputRef.current) {
            emailInputRef.current.focus();
        }
    }, []);

    return (
        <div className="register-container">
            <div className="form-container">
                <ErrorTextContext value={{errorText, setErrorText, showErrorText, setShowErrorText}}>
                    <h1>Create an Account</h1>
                    <form onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            e.preventDefault();
                            if (buttonRef.current) {
                                buttonRef.current.click();
                            }
                        }}}>
                        { showErrorText === true ? <h2>{errorText}</h2> : null }
                        <AuthInput label={"Email:"} ref={emailInputRef} callBack={setEmail} inputType="email" name="email"/>
                        <AuthInput label={"Password:"} callBack={setPassword} inputType="password" name="password"/>
                        <AuthInput label={"Confirm password:"} callBack={setPasswordConf} inputType="password" name="conf_password"/>
                        <SubmitButton inputValues={inputValues} buttonRef={buttonRef} setRegisterState={setState}/>
                    </form>
                </ErrorTextContext>
            </div>
        </div>
    );
}

function RegisterSuccessMessage() {
    const navigate = useNavigate();

    return (
        <div className="register-success-container">
            <span className="register-success-message">
                Your account has been created.
            </span>
            <button className="login-btn" onClick={() => {navigate("/")}}>Sign in</button>
        </div>
    );
}

export type RegisterFormInputValues = {
    email: string;
    password: string;
    password_conf: string;
};

type SubmitButtonProps = {
    inputValues: RegisterFormInputValues;
    buttonRef: React.RefObject<HTMLButtonElement | null>;
    setRegisterState: React.Dispatch<React.SetStateAction<RegisterState>>;
};

type SubmitState = "enabled" | "disabled";

function SubmitButton({
    inputValues,
    buttonRef,
    setRegisterState,
}: SubmitButtonProps) {
    const [state, setState] = useState<SubmitState>("enabled");
    const [label, setLabel] = useState("Submit");
    const errorTextContext = useContext(ErrorTextContext);

    async function clickHandler() {
        setState("disabled");
        setLabel("Creating account...");
        const isInvalid = validateFormFields(inputValues);
        if (isInvalid) {
            showError(isInvalid, errorTextContext);
        } else {
            const success = await register(inputValues.email, inputValues.password);

            if (success) {
                setRegisterState("success");
            } else {
                showError("Email already in use, or an error occurred", errorTextContext);
            }
        }
        setLabel("Submit");
        setState("enabled");
    }

    return (
        <div className="submit-container">
            <button className='submit-btn' disabled={state === "disabled"} type="button" ref={buttonRef} onClick={clickHandler}>{label}</button>
        </div>
    );
}
