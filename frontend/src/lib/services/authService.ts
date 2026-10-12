export async function logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user-email');
    localStorage.removeItem('expiry_time');
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/logout`, {
            method: 'POST',
            credentials: 'include'
        });
        if (response.status !== 204) console.error("Unable to clear access token cookie.");
    } catch (error) {
        console.error("Error while logging out: ", error);
    }
    if (window.location.pathname === "/") return;
    if (window.location.pathname === "/register") return;
    window.location.href = "/";
}

let logoutTimer: number | undefined = undefined;

export async function scheduleLogout(expiryTime: number) {
    clearTimeout(logoutTimer);
    const msLeft = expiryTime * 1000 - Date.now();
    if (msLeft <= 0) {
        await logout();
        return;
    }
    logoutTimer = setTimeout(logout, msLeft);
}