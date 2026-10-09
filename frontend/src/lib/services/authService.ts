import { useNavigate } from 'react-router';

const navigate = useNavigate();

export function logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('token_type');
    localStorage.removeItem('user-email');
    localStorage.removeItem('user-log-in-time');
    navigate('/');
}