import type { User } from '../types/index';
import { CONFIG } from '../../config';

export async function register(email: string, password: string): Promise<boolean> {
    try {
        const res = await fetch(`${CONFIG.API_BASE_URL}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });
        return res.ok;
    } catch {
        return false;
    }
}

export async function login(email: string, password: string): Promise<User | null> {
    try {
        const result = await fetch(`${CONFIG.API_BASE_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });
        if (!result.ok) {
            return null;
        }
        const data = await result.json();
        const token: string = data.access_token;
        const me = await fetchMe(token);
        if (!me) {
            return null;
        }
        return { id: me.id, email: me.email, token };
    } catch {
        return null;
    }
}

async function fetchMe(token: string): Promise<{ id: string; email: string } | null> {
    try {
        const res = await fetch(`${CONFIG.API_BASE_URL}/auth/me`, {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` },
        });
        if (!res.ok) {
            return null;
        }
        const data = await res.json();
        return { id: data.id, email: data.email };
    } catch {
        return null;
    }
}
