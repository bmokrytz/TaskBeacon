import { useContext, useEffect } from 'react';
import { ErrorTextContext } from './context';

type AuthInputProps = {
    label: string;
    ref?: React.RefObject<HTMLInputElement | null>;
    inputType: "email" | "password";
    name: string;
    callBack: React.Dispatch<React.SetStateAction<string>>;
};

export function AuthInput({
    label,
    ref,
    inputType,
    name,
    callBack,
}: AuthInputProps) {
    const errorTextContext = useContext(ErrorTextContext);
    const showErrorText = errorTextContext.showErrorText;

    useEffect(() => {
        if (ref) ref.current?.focus();
    }, [ref]);

    return (
        <div className="auth-input" style={{ paddingBottom: "30px" }}>
            <div className="auth-input-label-container">
                <label>{label}</label>
                { showErrorText === true ? <label className="required-field-label">*</label> : null }
            </div>
            <br/>
            <input type={inputType} ref={ref} id={name} name={name}
                placeholder={inputType === "email" ? "you@example.com" : "••••••••"}
                onChange={e => callBack(e.target.value)}/>
        </div>
    )
}
