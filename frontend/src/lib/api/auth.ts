import { validateEmail, validatePassword, validatePasswordMatch, ValidationError } from '@/lib/utils/validate';

export async function login(email: string, password: string): Promise<boolean> {
    const isEmailValid = validateEmail(email);
    const isPassValid = validatePassword(password)
    if (!isEmailValid && !isPassValid) {
        if (email.length === 0 && password.length === 0) throw new ValidationError("No email and no password");
        else if (email.length === 0) throw new ValidationError("No email");
        else if (password.length === 0) throw new ValidationError("No password");
        else throw new ValidationError("Invalid credentials");
    }
    if (!isEmailValid) {
        if (email.length === 0) {
            throw new ValidationError("No email");
        }
        throw new ValidationError("Invalid credentials");
    }
    if (!validatePassword(password)) {
        if (password.length === 0) {
            throw new ValidationError("No password");
        }
        throw new ValidationError("Invalid credentials");
    }

    const requestUrl = `${import.meta.env.VITE_API_URL}/api/auth/login`;
    try {
        const response = await fetch(`${requestUrl}`, {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });
        if (!response.ok) return false;
        const data = await response.json();
        const access_token = data.access_token;
        const token_type = data.token_type;
        localStorage.setItem('access_token', access_token);
        localStorage.setItem('token_type', token_type);
        return response.ok;
    } catch (error) {
        console.error("Error while logging in: ", error);
        return false;
    }
}

export async function register(email: string, password: string, confirmPassword: string): Promise<boolean> {
    const isEmailValid = validateEmail(email);
    const isPassValid = validatePassword(password);
    const isPassMatch = validatePasswordMatch(password, confirmPassword);
    if (!isEmailValid && !isPassValid) {
        if (email.length === 0) {
            throw new ValidationError("No email and invalid password");
        }
        throw new ValidationError("Invalid email and invalid password");
    }
    if (!isEmailValid) {
        if (email.length === 0) throw new ValidationError("No email");
        throw new ValidationError("Invalid email");
    }
    if (!isPassValid) throw new ValidationError("Invalid password");
    if (!isPassMatch) throw new ValidationError("Passwords do not match");

    const requestUrl = `${import.meta.env.VITE_API_URL}/api/auth/register`;
    try {
        const response = await fetch(`${requestUrl}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({email: email, password: password}),
        });
        if (!response.ok) {
            if (response.status === 409) throw new ValidationError("Conflict");
            else return false;
        }
        return true;
    } catch(error) {
        if (error instanceof ValidationError && error.message === "Conflict") throw error; 
        console.error("Error registering new user: ", error);
        return false;
    }
}
