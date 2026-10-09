export function logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('token_type');
    localStorage.removeItem('user-email');
    localStorage.removeItem('expiry_time');
    window.location.href = "/";
}

let logoutTimer: number | undefined = undefined;

export function scheduleLogout(expiryTime: number) {
    clearTimeout(logoutTimer);
    const msLeft = expiryTime * 1000 - Date.now();
    if (msLeft <= 0) {
        logout();
        return;
    }
    logoutTimer = setTimeout(logout, msLeft);
}