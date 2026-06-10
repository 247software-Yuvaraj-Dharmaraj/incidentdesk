import { type Incident } from '@/types/incident';

const escape = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;

/** Export the given incidents to a downloaded CSV file. */
export function exportIncidentsCsv(incidents: Incident[], filename = 'incidents.csv') {
	const headers = ['ID', 'Title', 'Type', 'Priority', 'Status', 'Reporter', 'Assignee', 'Due date', 'Created'];
	const rows = incidents.map((i) => [i.id, i.title, i.type, i.priority, i.status, i.reporter.fullName, i.assignee?.fullName ?? '', i.dueDate ?? '', i.createdAt].map(escape).join(','));
	const csv = [headers.map(escape).join(','), ...rows].join('\r\n');

	// Prepend a UTF-8 BOM so Excel detects the encoding correctly.
	const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = filename;
	a.click();
	URL.revokeObjectURL(url);
}
