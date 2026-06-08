import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from '@/components/protected-route';
import { AppLayout } from '@/components/app-layout';
import { LoginPage } from '@/pages/login';
import { SignupPage } from '@/pages/signup';
import { DashboardPage } from '@/pages/dashboard';
import { IncidentsListPage } from '@/pages/incidents-list';
import { IncidentNewPage } from '@/pages/incident-new';
import { IncidentDetailPage } from '@/pages/incident-detail';

function App() {
	return (
		<BrowserRouter>
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
		</BrowserRouter>
	);
}

export default App;
