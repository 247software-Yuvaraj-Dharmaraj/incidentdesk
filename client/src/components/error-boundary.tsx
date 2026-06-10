import { Component, type ErrorInfo, type ReactNode } from 'react';
import i18n from '@/i18n';

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
					<h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{i18n.t('errors.title')}</h1>
					<p className="text-slate-500 dark:text-slate-400">{i18n.t('errors.body')}</p>
					<button
						type="button"
						onClick={() => window.location.reload()}
						className="bg-brand text-brand-fg hover:bg-brand-hover focus-visible:ring-brand/50 rounded-lg px-4 py-2 text-sm font-medium transition focus-visible:ring-2 focus-visible:outline-none"
					>
						{i18n.t('errors.reload')}
					</button>
				</div>
			);
		}
		return this.props.children;
	}
}
