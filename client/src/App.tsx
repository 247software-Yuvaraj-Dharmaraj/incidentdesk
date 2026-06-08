import { useEffect, useState } from 'react';

type HealthState = 'checking' | 'ok' | 'error';

function App() {
	const [health, setHealth] = useState<HealthState>('checking');

	useEffect(() => {
		fetch(`${import.meta.env.VITE_API_URL}/api/health`)
			.then((res) => (res.ok ? setHealth('ok') : setHealth('error')))
			.catch(() => setHealth('error'));
	}, []);

	const statusColor = health === 'ok' ? 'bg-green-500' : health === 'error' ? 'bg-red-500' : 'bg-yellow-400';
	const statusText = health === 'ok' ? 'API connected' : health === 'error' ? 'API unreachable' : 'Checking API…';

	return (
		<div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-slate-50 text-slate-900">
			<h1 className="text-4xl font-bold tracking-tight">IncidentDesk</h1>
			<p className="text-slate-500">Incident &amp; request management — work in progress</p>
			<div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm">
				<span className={`inline-block h-2.5 w-2.5 rounded-full ${statusColor}`} />
				<span className="text-sm font-medium">{statusText}</span>
			</div>
		</div>
	);
}

export default App;
