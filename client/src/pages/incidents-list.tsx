import { Link } from 'react-router-dom';
import { useIncidents } from '@/hooks/use-incidents';
import { StatusBadge, PriorityBadge } from '@/components/badges';

export function IncidentsListPage() {
	const { data, isLoading, isError, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } = useIncidents({});

	const incidents = data?.pages.flatMap((page) => page.items) ?? [];

	return (
		<div>
			<div className="mb-6 flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold text-slate-900">Incidents</h1>
					<p className="text-sm text-slate-500">Track and manage incidents and requests</p>
				</div>
				<Link to="/incidents/new" className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800">
					+ New incident
				</Link>
			</div>

			{isLoading && <SkeletonRows />}

			{isError && (
				<div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
					<p className="text-sm text-red-600">Failed to load incidents.</p>
					<button onClick={() => refetch()} className="mt-2 text-sm font-medium text-red-700 underline">
						Try again
					</button>
				</div>
			)}

			{!isLoading && !isError && incidents.length === 0 && (
				<div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
					<p className="text-slate-500">No incidents yet.</p>
					<Link to="/incidents/new" className="mt-2 inline-block text-sm font-medium text-slate-900 underline">
						Create the first one
					</Link>
				</div>
			)}

			{incidents.length > 0 && (
				<div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
					<table className="w-full text-left text-sm">
						<thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
							<tr>
								<th className="px-4 py-3 font-medium">Title</th>
								<th className="px-4 py-3 font-medium">Type</th>
								<th className="px-4 py-3 font-medium">Priority</th>
								<th className="px-4 py-3 font-medium">Status</th>
								<th className="px-4 py-3 font-medium">Reported</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-100">
							{incidents.map((incident) => (
								<tr key={incident.id} className="transition hover:bg-slate-50">
									<td className="px-4 py-3">
										<Link to={`/incidents/${incident.id}`} className="font-medium text-slate-900 hover:underline">
											{incident.title}
										</Link>
									</td>
									<td className="px-4 py-3 text-slate-500">{incident.type}</td>
									<td className="px-4 py-3">
										<PriorityBadge priority={incident.priority} />
									</td>
									<td className="px-4 py-3">
										<StatusBadge status={incident.status} />
									</td>
									<td className="px-4 py-3 text-slate-500">{new Date(incident.createdAt).toLocaleDateString()}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}

			{hasNextPage && (
				<div className="mt-4 text-center">
					<button onClick={() => fetchNextPage()} disabled={isFetchingNextPage} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:opacity-60">
						{isFetchingNextPage ? 'Loading…' : 'Load more'}
					</button>
				</div>
			)}
		</div>
	);
}

function SkeletonRows() {
	return (
		<div className="space-y-2">
			{Array.from({ length: 5 }).map((_, i) => (
				<div key={i} className="h-12 animate-pulse rounded-lg bg-slate-100" />
			))}
		</div>
	);
}
