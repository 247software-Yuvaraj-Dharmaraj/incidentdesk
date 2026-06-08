import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from '@/components/protected-route';
import { AppLayout } from '@/components/app-layout';
import { PageLoader } from '@/components/page-loader';

const LoginPage = lazy(() => import('@/pages/login').then((m) => ({ default: m.LoginPage })));
const SignupPage = lazy(() => import('@/pages/signup').then((m) => ({ default: m.SignupPage })));
const DashboardPage = lazy(() => import('@/pages/dashboard').then((m) => ({ default: m.DashboardPage })));
const IncidentsListPage = lazy(() => import('@/pages/incidents-list').then((m) => ({ default: m.IncidentsListPage })));
const IncidentNewPage = lazy(() => import('@/pages/incident-new').then((m) => ({ default: m.IncidentNewPage })));
const IncidentDetailPage = lazy(() => import('@/pages/incident-detail').then((m) => ({ default: m.IncidentDetailPage })));

function App() {
	return (
		<BrowserRouter>
			<Suspense fallback={<PageLoader />}>
				<Routes>
					<Route path="/login" element={<LoginPage />} />
					<Route path="/signup" element={<SignupPage />} />

					<Route element={<ProtectedRoute />}>
						<Route element={<AppLayout />}>
							<Route path="/dashboard" element={<DashboardPage />} />
							<Route path="/incidents" element={<IncidentsListPage />} />
							<Route path="/incidents/new" element={<IncidentNewPage />} />
							<Route path="/incidents/:id" element={<IncidentDetailPage />} />
						</Route>
					</Route>

					<Route path="/" element={<Navigate to="/dashboard" replace />} />
					<Route path="*" element={<Navigate to="/dashboard" replace />} />
				</Routes>
			</Suspense>
		</BrowserRouter>
	);
}

export default App;
