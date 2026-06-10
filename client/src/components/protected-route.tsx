import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/auth-context';
import { type Role } from '@/types/user';
import { PageLoader } from '@/components/page-loader';

interface ProtectedRouteProps {
	roles?: Role[];
}

export function ProtectedRoute({ roles }: ProtectedRouteProps) {
	const { user, isLoading } = useAuth();

	if (isLoading) {
		return <PageLoader />;
	}

	if (!user) {
		return <Navigate to="/login" replace />;
	}

	if (roles && !roles.includes(user.role)) {
		return <Navigate to="/dashboard" replace />;
	}

	return <Outlet />;
}
