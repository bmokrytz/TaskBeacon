import { validateEmail, validatePassword } from '@/lib/utils/validate';

export async function login(email: string, password: string): Promise<boolean> {
    if (!validateEmail(email)) { console.error("Invalid email format"); return false; }
    //if (!validatePassword(password)) { console.error("Invalid password format"); return false; }

    const requestUrl = `${import.meta.env.VITE_API_URL}/api/auth/login`;
    try {
        console.log("Sending login request to:", requestUrl);
        const response = await fetch(`${requestUrl}`, {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });
        console.log("Login response:", response);
        const data = await response.json();
        const accessToken = data.access_token;
        const tokenType = data.token_type;
        console.log("Received token:", accessToken, "of type:", tokenType);
        return response.ok;
    } catch (error) {
        console.error("Error during login:", error);
        return false;
    }
}