import React, { useEffect, useState } from 'react';
import type { Proposal } from '../types';
import Dispatcher from '../utils/dispatcher';
import { fetchDataByQuery, timestamp, url } from '../utils';

type UseProposalsByRoundConfig = {
	roundId: number;
};

export const useProposalsByRound = ({ roundId }: UseProposalsByRoundConfig) => {
	const [proposals, setProposals] = useState<Proposal[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [isError, setIsError] = useState<boolean>(false);
	const [error, setError] = useState<string>('');

	const dispatch = new Dispatcher<Proposal[]>(
		setProposals,
		setIsLoading,
		setIsError,
		setError
	);

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
	}, [roundId]);

	return { proposals, isLoading, isError, error };
};

const formatData = (
	data: any,
	fallback: Proposal[]
): { data: Proposal[]; error?: string } => {
	if (!data) return { data: fallback, error: 'query_failed' };

	const { data: result, errors: error } = data;
	const props = result?.auction?.proposals ?? [];

	if (error) return { data: fallback, error: JSON.stringify(error) };

	const formattedProps: Proposal[] = props.map((prop: any) => {
		const proposal = {
			round: {
				id: result?.auction?.id ?? -1,
				name: result?.auction?.title ?? '',
				status: result?.auction?.status ?? '',
			},
			id: prop?.id ?? -1,
			created: timestamp(prop?.createdDate),
			proposer: prop?.address ?? '',
			title: prop?.title ?? '',
			summary: prop?.tldr ?? '',
			content: prop?.what ?? '',
			voteCount: prop?.voteCount ?? 0,
			votes:
				prop?.votes?.map((vote: any) => {
					return {
						created: timestamp(vote?.createdDate),
						voter: vote?.address ?? '',
						weight: vote?.weight ?? 0,
					};
				}) ?? [],
			url: url(['proposal', String(prop?.id)]),
		};

		if (proposal.votes?.length) {
			proposal.votes = proposal.votes.sort(
				(a: any, b: any) => b.created - a.created
			);
		}

		return proposal;
	});

	return { data: formattedProps };
};

const query = `query GetProposalsByRoundId($id: Int!) {
  auction(id: $id) {
    id
		title
		status
		proposals {
      createdDate
      address
      id
      title
      tldr
      what
      votes {
        address
        createdDate
        weight
      }
      voteCount
    }
  }
}`;
