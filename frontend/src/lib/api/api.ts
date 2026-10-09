import { logout } from '@/lib/services/authService';

export async function apiFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const response = await fetch(input, init);
    if (response.status === 401) {
        logout();
    }
    return response;
}