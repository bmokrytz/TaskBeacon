import { validateEmail, validatePassword } from '@/lib/utils/validate';

export function login(email: string, password: string): void {
    if (!validateEmail(email)) {
        console.error("Invalid email format");
        return;
    }

    if (!validatePassword(password)) {
        console.error("Invalid password format");
        return;
    }

    // Implement login logic here
    console.log("Login function called");
}