import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
	children: ReactNode;
}

interface State {
	hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
	state: State = { hasError: false };

	static getDerivedStateFromError(): State {
		return { hasError: true };
	}

	componentDidCatch(error: Error, info: ErrorInfo) {
		console.error('Uncaught error:', error, info);
	}

	render() {
		if (this.state.hasError) {
			return (
				<div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-4 text-center dark:bg-slate-950">
					<h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Something went wrong</h1>
					<p className="text-slate-500 dark:text-slate-400">An unexpected error occurred. Please reload the page.</p>
					<button
						type="button"
						onClick={() => window.location.reload()}
						className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:outline-none dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
					>
						Reload
					</button>
				</div>
			);
		}
		return this.props.children;
	}
}
