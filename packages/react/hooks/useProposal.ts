import React, { useEffect, useState } from 'react';
import type { Proposal } from '../types';
import { fetchDataByQuery, timestamp } from '../utils';

type UseRoundConfig = {
	id: number;
};

export const useProposal = ({ id }: UseRoundConfig): Proposal | undefined => {
	if (!id) return;

	const [proposal, setProposal] = useState<Proposal>();

	useEffect(() => {
		const getData = async () => {
			const data = await fetchDataByQuery(query, { id });
			if (!data) {
				setProposal(undefined);
				return;
			}
			setProposal(formatData(data));
		};

		if (id) getData();
		else setProposal(undefined);
	}, [id]);

	return proposal;
};

const formatData = (data: any): Proposal | undefined => {
	const { data: result, error } = data;
	const prop = result?.proposal;

	if (error) {
		// console.error(error);
		return;
	}

	return {
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
		url: 'https://prop.house/proposal/' + prop?.id,
	};
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
