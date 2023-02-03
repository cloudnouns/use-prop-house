import React, { useEffect, useState } from 'react';
import type { Vote } from '../types';
import { fetchDataByQuery, timestamp } from '../utils';

type UseRoundVotesConfig = {
	roundId: number;
};

export const useRoundVotes = ({ roundId }: UseRoundVotesConfig): Vote[] => {
	if (!roundId) return [];

	const [votes, setVotes] = useState<Vote[]>([]);

	useEffect(() => {
		const getData = async () => {
			const data = await fetchDataByQuery(query, { id: roundId });
			if (!data) {
				setVotes([]);
				return;
			} else {
				const clean = formatData(data);
				if (!clean) setVotes([]);
				else setVotes(clean);
			}
		};

		if (roundId) getData();
		else setVotes([]);
	}, [roundId]);

	return votes;
};

const formatData = (data: any): Vote[] | undefined => {
	const { data: result, error } = data;
	const props = result?.auction?.proposals ?? [];

	if (error) {
		// console.error(error);
		return;
	}

	return props
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
							url: 'https://prop.house/proposal/' + prop?.id,
						},
					};
				});
		})
		.flat()
		.sort((a: any, b: any) => b.created - a.created, 0);
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
