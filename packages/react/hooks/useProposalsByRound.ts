import React, { useEffect, useMemo, useState } from 'react';
import type { Proposal } from '../types';
import Dispatcher from '../utils/dispatcher';
import { fetchDataByQuery, timestamp, url } from '../utils';

type UseProposalsByRoundConfig = {
	roundId: number;
};

export const useProposalsByRound = ({ roundId }: UseProposalsByRoundConfig) => {
	const [proposals, setProposals] = useState<Proposal[]>([]);
	const [error, setError] = useState<string>('');
	const [isLoading, setIsLoading] = useState<boolean>(true);

	const dispatch = useMemo(() => {
		return new Dispatcher<Proposal[]>(setProposals, setIsLoading, setError);
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

	return { data: proposals, error, isLoading };
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
			isWinner: false,
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

	// mark winners
	const roundStatus = result?.auction?.status ?? '';
	if (roundStatus === 'Closed') {
		const winnerCount = result?.auction?.numWinners ?? 0;
		const winners = formattedProps
			.sort((a, b) => b.voteCount - a.voteCount)
			.slice(0, winnerCount);

		for (const winner of winners) {
			const propIndex = formattedProps.findIndex((p) => p.id === winner.id);
			if (propIndex >= 0) formattedProps[propIndex].isWinner = true;
		}
	}

	return { data: formattedProps };
};

const query = `query GetProposalsByRoundId($id: Int!) {
  auction(id: $id) {
    id
		title
		status
		numWinners
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
