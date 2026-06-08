import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { queryClient } from '@/lib/query-client';
import { AuthProvider } from '@/context/auth-context';
import { ThemeProvider } from '@/context/theme-context';
import { DensityProvider } from '@/context/density-context';
import { ErrorBoundary } from '@/components/error-boundary';
import '@/i18n';
import './index.css';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<ErrorBoundary>
			<ThemeProvider>
				<DensityProvider>
					<QueryClientProvider client={queryClient}>
						<AuthProvider>
							<App />
							<Toaster position="top-right" richColors />
						</AuthProvider>
					</QueryClientProvider>
				</DensityProvider>
			</ThemeProvider>
		</ErrorBoundary>
	</StrictMode>
);
