import React, { useEffect, useState } from 'react';
import type { Proposal } from '../types';
import { fetchDataByQuery, timestamp, url } from '../utils';

type UseProposalConfig = {
	id: number;
};

const emptyProposal = {} as Proposal;

export const useProposal = ({ id }: UseProposalConfig) => {
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [proposal, setProposal] = useState<Proposal>(emptyProposal);

	useEffect(() => {
		setIsLoading(true);

		const getData = async () => {
			const data = await fetchDataByQuery(query, { id });
			const clean = formatData(data);
			if (!clean) setProposal(emptyProposal);
			else setProposal(clean);
			setIsLoading(false);
		};

		if (id) getData();
		else {
			setProposal(emptyProposal);
			setIsLoading(false);
		}
	}, [id]);

	return { isLoading, proposal };
};

const formatData = (data: any): Proposal | undefined => {
	if (!data) return;

	const { data: result, error } = data;
	const prop = result?.proposal;

	if (error) {
		// console.error(error);
		return;
	}

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

	return proposal;
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
