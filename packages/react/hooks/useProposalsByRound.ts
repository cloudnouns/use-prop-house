import React, { useEffect, useState } from 'react';
import type { Proposal } from '../types';
import { fetchDataByQuery, timestamp, url } from '../utils';

type UseProposalsByRoundConfig = {
	roundId: number;
};

export const useProposalsByRound = ({ roundId }: UseProposalsByRoundConfig) => {
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [proposals, setProposals] = useState<Proposal[]>([]);

	useEffect(() => {
		setIsLoading(true);

		const getData = async () => {
			const data = await fetchDataByQuery(query, { id: roundId });
			const clean = formatData(data);
			if (!clean) setProposals([]);
			else setProposals(clean);
			setIsLoading(false);
		};

		if (roundId) getData();
		else {
			setProposals([]);
			setIsLoading(false);
		}
	}, [roundId]);

	return { isLoading, proposals };
};

const formatData = (data: any): Proposal[] | undefined => {
	if (!data) return;

	const { data: result, errors } = data;
	const props = result?.auction?.proposals ?? [];

	if (errors) {
		console.error(errors);
		return;
	}

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

	return formattedProps ?? [];
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
