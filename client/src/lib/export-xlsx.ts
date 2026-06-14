import ExcelJS from 'exceljs';
import { type Incident } from '@/types/incident';

/** Export the given incidents to a downloaded .xlsx file with typed columns and a styled header. */
export async function exportIncidentsXlsx(incidents: Incident[], filename = 'incidents.xlsx') {
	const workbook = new ExcelJS.Workbook();
	workbook.creator = 'IncidentDesk';
	workbook.created = new Date();

	const sheet = workbook.addWorksheet('Incidents', {
		views: [{ state: 'frozen', ySplit: 1 }],
	});

	sheet.columns = [
		{ header: 'ID', key: 'id', width: 26 },
		{ header: 'Title', key: 'title', width: 42 },
		{ header: 'Type', key: 'type', width: 14 },
		{ header: 'Priority', key: 'priority', width: 12 },
		{ header: 'Status', key: 'status', width: 14 },
		{ header: 'Reporter', key: 'reporter', width: 22 },
		{ header: 'Assignee', key: 'assignee', width: 22 },
		{ header: 'Due date', key: 'dueDate', width: 20, style: { numFmt: 'yyyy-mm-dd hh:mm' } },
		{ header: 'Created', key: 'createdAt', width: 20, style: { numFmt: 'yyyy-mm-dd hh:mm' } },
	];

	incidents.forEach((i) => {
		sheet.addRow({
			id: i.id,
			title: i.title,
			type: i.type,
			priority: i.priority,
			status: i.status,
			reporter: i.reporter.fullName,
			assignee: i.assignee?.fullName ?? '',
			dueDate: i.dueDate ? new Date(i.dueDate) : null,
			createdAt: new Date(i.createdAt),
		});
	});

	const header = sheet.getRow(1);
	header.font = { bold: true, color: { argb: 'FFFFFFFF' } };
	header.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F1729' } };
	header.alignment = { vertical: 'middle' };
	sheet.autoFilter = { from: 'A1', to: 'I1' };

	const buffer = await workbook.xlsx.writeBuffer();
	const blob = new Blob([buffer], {
		type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
	});
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = filename;
	a.click();
	URL.revokeObjectURL(url);
}
