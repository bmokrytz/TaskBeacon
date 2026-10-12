import { logout } from '@/lib/services/authService';

export async function apiFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const response = await fetch(input, { ...init, credentials: 'include' });
    if (response.status === 401) {
        await logout();
    }
    return response;
}