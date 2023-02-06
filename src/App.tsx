import { useEffect, useState } from 'react';
import {
	useRound,
	useRoundsByHouse,
	useRoundsByStatus,
	useVotesByRound,
	useProposalsByRound,
	useProposal,
	useHouse,
	usePropHouses,
} from '../packages/react';

type Status = 'open' | 'upcoming' | 'voting' | 'closed';

const App = () => {
	const [status, setStatus] = useState<Status>('open');
	// const rounds = useRoundsByHouse({ houseId: 21, status });
	// const { isLoading, house } = useHouse({ id: 21 });
	const {
		votes: data,
		isLoading,
		isError,
		error,
	} = useVotesByRound({ roundId: 137 });

	useEffect(() => {
		if (data) console.log(data);
	}, [data]);

	if (isLoading) return <p>loading data</p>;
	if (isError) return <p>error: {error}</p>;
	return (
		<div>
			<button onClick={() => setStatus('open')}>Open Rounds</button>
			<button onClick={() => setStatus('upcoming')}>Upcoming Rounds</button>
			<button onClick={() => setStatus('voting')}>Voting Rounds</button>
			<button onClick={() => setStatus('closed')}>Closed Rounds</button>

			<p>{JSON.stringify(data, null, 2)}</p>
		</div>
	);
};

export default App;
