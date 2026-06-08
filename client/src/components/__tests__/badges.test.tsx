import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PriorityBadge, StatusBadge } from '../badges';

describe('badges', () => {
	it('renders the status label with underscores replaced', () => {
		render(<StatusBadge status="IN_PROGRESS" />);
		expect(screen.getByText('IN PROGRESS')).toBeInTheDocument();
	});

	it('renders the priority label', () => {
		render(<PriorityBadge priority="CRITICAL" />);
		expect(screen.getByText('CRITICAL')).toBeInTheDocument();
	});
});
