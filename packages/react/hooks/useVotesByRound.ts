import React, { useEffect, useState } from 'react';
import type { Vote } from '../types';
import { fetchDataByQuery, timestamp, url } from '../utils';

type UseVotesByRoundConfig = {
	roundId: number;
};

export const useVotesByRound = ({ roundId }: UseVotesByRoundConfig) => {
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [votes, setVotes] = useState<Vote[]>([]);

	useEffect(() => {
		setIsLoading(true);

		const getData = async () => {
			const data = await fetchDataByQuery(query, { id: roundId });
			const clean = formatData(data);
			if (!clean) setVotes([]);
			else setVotes(clean);
			setIsLoading(false);
		};

		if (roundId) getData();
		else {
			setVotes([]);
			setIsLoading(false);
		}
	}, [roundId]);

	return { isLoading, votes };
};

const formatData = (data: any): Vote[] | undefined => {
	if (!data) return;

	const { data: result, error } = data;
	const props = result?.auction?.proposals ?? [];

	if (error) {
		// console.error(error);
		return;
	}

	const formattedVotes = props
		?.map((prop: any) => {
			return prop?.votes
				?.filter((vote: any) => vote?.signatureState === 'VALIDATED')
				.map((vote: any) => {
					return {
						created: timestamp(vote?.createdDate),
						voter: vote?.address,
						weight: vote?.weight,
						proposal: {
							id: prop?.id,
							title: prop?.title,
							url: url(['proposal', String(prop?.id)]),
						},
					};
				});
		})
		.flat()
		.sort((a: Vote, b: Vote) => b.created - a.created, 0);

	return formattedVotes;
};

const query = `query GetVotesByRoundId ($id: Int!) {
  auction(id: $id) {
    proposals {
      id
      title
      votes {
        address
        createdDate
        weight
				signatureState
      }
    }
  }
}`;
