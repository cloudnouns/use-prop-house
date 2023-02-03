import { useEffect } from 'react';
import {
	useHouse,
	useHouses,
	useRound,
	useHouseRounds,
	useOpenRounds,
	useProposal,
	useRoundProposals,
	useRoundVotes,
	useUpcomingRounds,
	useVotingRounds,
} from '../packages/react';

const App = () => {
	const houses = useHouses();
	const house = useHouse({ id: 21 });
	const round = useRound({ id: 132 });
	const proposal = useProposal({ id: 3423 });
	const proposals = useRoundProposals({ roundId: 132 });
	const votes = useRoundVotes({ roundId: 58 });
	// const rounds = useHouseRounds({ houseId: 21 });
	// const rounds = useUpcomingRounds();
	// const rounds = useOpenRounds();
	const rounds = useVotingRounds();

	useEffect(() => {
		if (rounds) console.log(rounds);
	}, [rounds]);

	return (
		<div>
			<p>howdy</p>
		</div>
	);
};

export default App;
