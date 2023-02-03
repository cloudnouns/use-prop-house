import { useEffect } from 'react';
import {
	useHouse,
	useHouses,
	useRound,
	useRounds,
	useProposal,
	useProposals,
	useVotes,
} from '../packages/react';

const App = () => {
	const houses = useHouses();
	const house = useHouse({ id: 21 });
	const round = useRound({ id: 132 });
	const rounds = useRounds({ houseId: 21 });
	const proposal = useProposal({ id: 3423 });
	const proposals = useProposals({ roundId: 132 });
	const votes = useVotes({ roundId: 58 });

	useEffect(() => {
		if (votes) console.log(votes);
	}, [votes]);

	return (
		<div>
			<p>howdy</p>
		</div>
	);
};

export default App;
