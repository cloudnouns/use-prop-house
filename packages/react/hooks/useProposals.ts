import React, { useEffect, useState } from 'react';
import type { Proposal } from '../types';
import { fetchDataByQuery, timestamp } from '../utils';

type UseProposalsConfig = {
	roundId: number;
};

export const useProposals = ({ roundId }: UseProposalsConfig): Proposal[] => {
	if (!roundId) return [];

	const [proposals, setProposals] = useState<Proposal[]>([]);

	useEffect(() => {
		const getData = async () => {
			const data = await fetchDataByQuery(query, { id: roundId });
			if (!data) {
				setProposals([]);
				return;
			} else {
				const clean = formatData(data);
				if (!clean) setProposals([]);
				else setProposals(clean);
			}
		};

		if (roundId) getData();
		else setProposals([]);
	}, [roundId]);

	return proposals;
};

const formatData = (data: any): Proposal[] | undefined => {
	const { data: result, error } = data;
	const props = result?.auction?.proposals ?? [];

	if (error) {
		// console.error(error);
		return;
	}

	const formattedProps: Proposal[] = props.map((prop: any) => {
		return {
			roundId: prop?.auctionId ?? -1,
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
	});

	return formattedProps ?? [];
};

const query = `query GetProposalsByRoundId($id: Int!) {
  auction(id: $id) {
    proposals {
      auctionId
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
