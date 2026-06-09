import { useState } from 'react';
import { flexRender, getCoreRowModel, getSortedRowModel, useReactTable, type ColumnDef, type SortingState } from '@tanstack/react-table';
import { useDensity } from '@/context/density-context';

interface DataGridProps<T> {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	columns: ColumnDef<T, any>[];
	data: T[];
	minWidth?: string;
}

/** Reusable sortable data grid built on TanStack Table. Density-aware via DensityProvider. */
export function DataGrid<T>({ columns, data, minWidth = '640px' }: DataGridProps<T>) {
	const { density } = useDensity();
	const [sorting, setSorting] = useState<SortingState>([]);

	// eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table manages its own memoization
	const table = useReactTable({
		data,
		columns,
		state: { sorting },
		onSortingChange: setSorting,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
	});

	const cellPad = density === 'compact' ? 'px-3 py-1.5' : 'px-4 py-3';

	return (
		<div className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
			<table className="w-full text-left text-sm" style={{ minWidth }}>
				<thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
					{table.getHeaderGroups().map((headerGroup) => (
						<tr key={headerGroup.id}>
							{headerGroup.headers.map((header) => {
								const sorted = header.column.getIsSorted();
								const canSort = header.column.getCanSort();
								return (
									<th key={header.id} scope="col" aria-sort={sorted === 'asc' ? 'ascending' : sorted === 'desc' ? 'descending' : undefined} className={`${cellPad} font-medium`}>
										{canSort ? (
											<button type="button" onClick={header.column.getToggleSortingHandler()} className="inline-flex items-center gap-1 uppercase hover:text-slate-700 focus-visible:underline focus-visible:outline-none dark:hover:text-slate-200">
												{flexRender(header.column.columnDef.header, header.getContext())}
												<span aria-hidden="true" className="text-[10px]">
													{sorted === 'asc' ? '▲' : sorted === 'desc' ? '▼' : '↕'}
												</span>
											</button>
										) : (
											flexRender(header.column.columnDef.header, header.getContext())
										)}
									</th>
								);
							})}
						</tr>
					))}
				</thead>
				<tbody className="divide-y divide-slate-100 dark:divide-slate-800">
					{table.getRowModel().rows.map((row) => (
						<tr key={row.id} className="group transition hover:bg-slate-50 dark:hover:bg-slate-800/50">
							{row.getVisibleCells().map((cell) => (
								<td key={cell.id} className={cellPad}>
									{flexRender(cell.column.columnDef.cell, cell.getContext())}
								</td>
							))}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
