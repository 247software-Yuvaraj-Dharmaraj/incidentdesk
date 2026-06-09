import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getSocket } from '@/lib/socket';
import { incidentKeys } from '@/hooks/use-incidents';

/** Opens an authenticated socket and refetches incident data when the server pushes a change. */
export function useRealtime() {
	const queryClient = useQueryClient();
	const [connected, setConnected] = useState(false);

	useEffect(() => {
		const socket = getSocket();

		const onConnect = () => setConnected(true);
		const onDisconnect = () => setConnected(false);
		const onChange = () => queryClient.invalidateQueries({ queryKey: incidentKeys.all });

		socket.on('connect', onConnect);
		socket.on('disconnect', onDisconnect);
		socket.on('incidents:changed', onChange);
		socket.connect();

		return () => {
			socket.off('connect', onConnect);
			socket.off('disconnect', onDisconnect);
			socket.off('incidents:changed', onChange);
			socket.disconnect();
		};
	}, [queryClient]);

	return { connected };
}
