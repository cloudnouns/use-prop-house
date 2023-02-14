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

export default function App() {
	const { data, error, isLoading } = useRoundsByHouse({
		houseId: 1,
		status: ['open', 'voting'], // omit to include all statuses
	});

	if (isLoading) return <p>Loading data...</p>;
	if (error) return <p>Error: {error}</p>;

	return (
		<>
			{data.map((round) => {
				return (
					<div key={round.id}>
						<a href={round?.url}>
							{round?.house.name}: {round?.name}
						</a>
						<p>{round?.description}</p>

						<ul>
							{round?.proposals.map((prop) => {
								return (
									<li key={prop.id}>
										<a href={prop.url}>
											<p>{prop.title}</p>
											<p>{prop.summary}</p>
										</a>
									</li>
								);
							})}
						</ul>
					</div>
				);
			})}
		</>
	);
}
