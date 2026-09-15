export function validateEmail(email: string): boolean {
    const emailRegex = /^(?=.{1,254}$)[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

export function validatePassword(password: string): boolean {
    // Password must be between 8 and 128 characters long and contain at least one uppercase letter, one lowercase letter, one digit, and one special character
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,128}$/;
    return passwordRegex.test(password);
}

export function validatePasswordMatch(password: string, confirmPassword: string): boolean {
    return password === confirmPassword;
}

export function isLoggedIn(): boolean {
    return localStorage.getItem("access_token") ? true : false;
}

export class ValidationError extends Error {}
