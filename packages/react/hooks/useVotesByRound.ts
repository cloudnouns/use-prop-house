import React, { useEffect, useMemo, useState } from 'react';
import type { Vote } from '../types';
import Dispatcher from '../utils/dispatcher';
import { fetchDataByQuery, timestamp, url } from '../utils';

type UseVotesByRoundConfig = {
	roundId: number;
};

export const useVotesByRound = ({ roundId }: UseVotesByRoundConfig) => {
	const [votes, setVotes] = useState<Vote[]>([]);
	const [error, setError] = useState<string>('');
	const [isLoading, setIsLoading] = useState<boolean>(true);

	const dispatch = useMemo(() => {
		return new Dispatcher<Vote[]>(setVotes, setIsLoading, setError);
	}, []);

	useEffect(() => {
		dispatch.reset();

		const getData = async () => {
			const response = await fetchDataByQuery(query, { id: roundId });
			const { data, error } = formatData(response, []);
			if (error) dispatch.err(error, data);
			else dispatch.update(data);
		};

		if (roundId) getData();
		else dispatch.err('invalid_id', []);
	}, [roundId, dispatch]);

	return { data: votes, error, isLoading };
};

const formatData = <T>(
	data: any,
	fallback: Vote[]
): { data: Vote[]; error?: string } => {
	if (!data) return { data: fallback, error: 'query_failed' };

	const { data: result, errors: error } = data;
	const props = result?.auction?.proposals ?? [];

	if (error) return { data: fallback, error: JSON.stringify(error) };

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

	return { data: formattedVotes };
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
