import { useState } from 'react';
import { flexRender, getCoreRowModel, getSortedRowModel, useReactTable, type ColumnDef, type OnChangeFn, type RowSelectionState, type SortingState } from '@tanstack/react-table';
import { useDensity } from '@/context/density-context';

interface DataGridProps<T> {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	columns: ColumnDef<T, any>[];
	data: T[];
	minWidth?: string;
	// Row selection (controlled): provide all three to render checkboxes.
	getRowId?: (row: T) => string;
	rowSelection?: RowSelectionState;
	onRowSelectionChange?: OnChangeFn<RowSelectionState>;
}

const checkboxClasses = 'h-4 w-4 cursor-pointer rounded border-slate-300 text-brand accent-brand focus-visible:ring-2 focus-visible:ring-slate-400 dark:border-slate-600';

/** Reusable sortable data grid built on TanStack Table. Density-aware; optional row selection. */
export function DataGrid<T>({ columns, data, minWidth = '640px', getRowId, rowSelection, onRowSelectionChange }: DataGridProps<T>) {
	const { density } = useDensity();
	const [sorting, setSorting] = useState<SortingState>([]);
	const selectable = Boolean(getRowId && rowSelection && onRowSelectionChange);

	// eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table manages its own memoization
	const table = useReactTable({
		data,
		columns,
		state: { sorting, rowSelection: rowSelection ?? {} },
		onSortingChange: setSorting,
		onRowSelectionChange,
		enableRowSelection: selectable,
		getRowId,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
	});

	const cellPad = density === 'compact' ? 'px-3 py-1.5' : 'px-4 py-3';

	return (
		<div className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
			<table className="w-full text-left text-sm" style={{ minWidth }}>
				<thead className="border-b border-slate-200 bg-slate-50 text-xs tracking-wide text-slate-500 uppercase dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
					{table.getHeaderGroups().map((headerGroup) => (
						<tr key={headerGroup.id}>
							{selectable && (
								<th scope="col" className={`${cellPad} w-10`}>
									<input
										type="checkbox"
										className={checkboxClasses}
										aria-label="Select all"
										checked={table.getIsAllRowsSelected()}
										ref={(el) => {
											if (el) el.indeterminate = !table.getIsAllRowsSelected() && table.getIsSomeRowsSelected();
										}}
										onChange={table.getToggleAllRowsSelectedHandler()}
									/>
								</th>
							)}
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
						<tr key={row.id} className={`transition hover:bg-slate-50 dark:hover:bg-slate-800/50 ${row.getIsSelected() ? 'bg-brand/5' : ''}`}>
							{selectable && (
								<td className={cellPad}>
									<input type="checkbox" className={checkboxClasses} aria-label="Select row" checked={row.getIsSelected()} onChange={row.getToggleSelectedHandler()} />
								</td>
							)}
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
