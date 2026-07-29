import type { LoginFormInputValues } from "../../pages/login/Login";
import type { RegisterFormInputValues } from "../../pages/register/Register";

function isRegisterFormInputValues(obj: LoginFormInputValues | RegisterFormInputValues): obj is RegisterFormInputValues {
    return obj && typeof (obj as RegisterFormInputValues).password_conf === 'string'
}

export function validateFormFields(inputValues: LoginFormInputValues | RegisterFormInputValues): string | null {
    if (!validateFieldsNotEmpty(Object.values(inputValues))) return "Enter all form fields *";
    if (!validateEmailShape(inputValues.email)) return "Enter a valid email address";
    if (!validatePasswordLength(inputValues.password)) return "Password must be at least 8 characters long";
    if (isRegisterFormInputValues(inputValues)) {
        if (!validatePasswordsMatch(inputValues.password, inputValues.password_conf)) return "Password fields do not match";
    }
    return null;
}

function validateFieldsNotEmpty(fieldsArray: Array<string>): boolean {
    return fieldsArray.every(field => !!field)
}

function validateEmailShape(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePasswordLength(password: string): boolean {
    return password.length >= 8;
}

function validatePasswordsMatch(password: string, conf_password: string): boolean {
    return password === conf_password;
}

export function validateTaskTitle(title: string): string | null {
    if (!title.trim()) return "Title cannot be empty";
    return null;
}
