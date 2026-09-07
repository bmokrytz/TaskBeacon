import { validateEmail } from '@/lib/utils/validate';
//import { validatePassword } from '@/lib/utils/validate';

export async function login(email: string, password: string): Promise<boolean> {
    if (!validateEmail(email)) { console.error("Invalid email format"); return false; }
    //if (!validatePassword(password)) { console.error("Invalid password format"); return false; }

    const requestUrl = `${import.meta.env.VITE_API_URL}/api/auth/login`;
    try {
        const response = await fetch(`${requestUrl}`, {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });
        const data = await response.json();
        const access_token = data.access_token;
        const token_type = data.token_type;
        localStorage.setItem('access_token', access_token);
        localStorage.setItem('token_type', token_type);
        return response.ok;
    } catch (error) {
        return false;
    }
}