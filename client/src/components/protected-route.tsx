import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/auth-context';
import { type Role } from '@/types/user';

interface ProtectedRouteProps {
	roles?: Role[];
}

export function ProtectedRoute({ roles }: ProtectedRouteProps) {
	const { user, isLoading } = useAuth();

	if (isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center text-slate-500">
				<span>Loading…</span>
			</div>
		);
	}

	if (!user) {
		return <Navigate to="/login" replace />;
	}

	if (roles && !roles.includes(user.role)) {
		return <Navigate to="/dashboard" replace />;
	}

	return <Outlet />;
}
