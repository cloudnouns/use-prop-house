import React, { useEffect, useState } from 'react';
import type { Proposal } from '../types';
import Dispatcher from '../utils/dispatcher';
import { fetchDataByQuery, timestamp, url } from '../utils';

type UseProposalConfig = {
	id: number;
};

const emptyProposal = {} as Proposal;

export const useProposal = ({ id }: UseProposalConfig) => {
	const [proposal, setProposal] = useState<Proposal>(emptyProposal);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [isError, setIsError] = useState<boolean>(false);
	const [error, setError] = useState<string>('');

	const dispatch = new Dispatcher<Proposal>(
		setProposal,
		setIsLoading,
		setIsError,
		setError
	);

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
	}, [id]);

	return { proposal, isLoading, isError, error };
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

	return { data: proposal };
};

const query = `query GetProposalById($id: Int!) {
  proposal(id: $id) {
    auction {
      id
      title
      status
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
