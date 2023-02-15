import React, { useEffect, useMemo, useState } from 'react';
import type { Proposal } from '../types';
import Dispatcher from '../utils/dispatcher';
import { fetchDataByQuery, timestamp, url } from '../utils';

type UseProposalConfig = {
	id: number;
};

const emptyProposal = {} as Proposal;

export const useProposal = ({ id }: UseProposalConfig) => {
	const [proposal, setProposal] = useState<Proposal>(emptyProposal);
	const [error, setError] = useState<string>('');
	const [isLoading, setIsLoading] = useState<boolean>(true);

	const dispatch = useMemo(() => {
		return new Dispatcher<Proposal>(setProposal, setIsLoading, setError);
	}, []);

	useEffect(() => {
		dispatch.reset();

		const getData = async () => {
			const response = await fetchDataByQuery(query, { id });
			const { data, error } = formatData(response, emptyProposal);
			if (error) dispatch.err(error, data);
			else dispatch.update(data);
		};

		if (id) getData();
		else dispatch.err('invalid_id', emptyProposal);
	}, [id, dispatch]);

	return { data: proposal, error, isLoading };
};

const formatData = (
	data: any,
	fallback: Proposal
): { data: Proposal; error?: string } => {
	if (!data) return { data: fallback, error: 'query_failed' };

	const { data: result, errors: error } = data;
	const prop = result?.proposal;

	if (error) return { data: fallback, error: JSON.stringify(error) };

	const proposal = {
		round: {
			id: prop?.auction?.id ?? -1,
			name: prop?.auction?.title ?? '',
			status: prop?.auction?.status ?? '',
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

	// mark winners
	const roundStatus = prop?.auction?.status ?? '';
	if (roundStatus === 'Closed') {
		const winnerCount = prop?.auction?.numWinners ?? 0;
		const winners = prop?.auction?.proposals
			?.sort((a: any, b: any) => b.voteCount - a.voteCount)
			.slice(0, winnerCount)
			.map((w: any) => w?.id);
		if (winners.includes(proposal.id)) proposal.isWinner = true;
	}

	return { data: proposal };
};

const query = `query GetProposalById($id: Int!) {
  proposal(id: $id) {
    auction {
      id
      title
      status
			numWinners
			proposals {
        id
        voteCount
      }
    }
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
}`;
