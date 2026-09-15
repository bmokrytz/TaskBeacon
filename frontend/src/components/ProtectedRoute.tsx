import { Navigate } from 'react-router';
import { isLoggedIn } from '@/lib/utils/validate';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
    if (!isLoggedIn()) {
        return <Navigate to="/" replace />;
    }
    return <>{children}</>;
}