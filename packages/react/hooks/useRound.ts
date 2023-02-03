import React, { useEffect, useState } from 'react';
import type { Round } from '../types';
import { fetchDataByQuery, slug, timestamp, url } from '../utils';

type UseRoundConfig = {
	id: number;
};

const emptyRound = {} as Round;

export const useRound = ({ id }: UseRoundConfig) => {
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [round, setRound] = useState<Round>();

	useEffect(() => {
		setIsLoading(true);

		const getData = async () => {
			const data = await fetchDataByQuery(query, { id });
			const clean = formatData(data);
			if (!data) setRound(emptyRound);
			else setRound(clean);
			setIsLoading(false);
		};

		if (id) getData();
		else {
			setRound(emptyRound);
			setIsLoading(false);
		}
	}, [id]);

	return { isLoading, round };
};

const formatData = (data: any): Round | undefined => {
	if (!data) return;

	const { data: result, error } = data;
	const round = result?.auction;

	if (error) {
		// console.error(error);
		return;
	}

	const formattedRound: Round = {
		house: {
			id: round?.community?.id ?? -1,
			name: round?.community?.name ?? '',
			slug: slug(round?.community?.name),
			url: url([round?.community?.name]),
			contract: round?.community?.contractAddress ?? '',
		},
		snapshotBlock: Number(round?.balanceBlockTag) ?? -1,
		id: round?.id ?? -1,
		created: timestamp(round?.createdDate),
		status: round?.status ?? '',
		name: round?.title ?? '',
		slug: slug(round?.title),
		description: round?.description ?? '',
		url: url([round?.community?.name, round?.title]),
		funding: {
			amount: round?.fundingAmount ?? 0,
			currency: round?.currencyType?.trim() ?? '',
			winners: round?.numWinners ?? 0,
		},
		startTime: timestamp(round?.startTime),
		proposalDeadline: timestamp(round?.proposalEndTime),
		voteDeadline: timestamp(round?.votingEndTime),
		proposals:
			round?.proposals?.map((prop: any) => {
				return {
					proposer: prop?.address ?? '',
					id: prop?.id ?? -1,
					created: timestamp(prop?.createdDate),
					title: prop?.title ?? '',
					summary: prop?.tldr ?? '',
					url: url(['proposal', String(prop?.id)]),
					votes: prop?.voteCount ?? 0,
				};
			}) ?? [],
	};

	if (Date.now() >= formattedRound.proposalDeadline) {
		formattedRound.proposals = formattedRound.proposals.sort(
			(a, b) => b.votes - a.votes
		);
	}

	return formattedRound;
};

const query = `query GetRoundById($id: Int!) {
  auction(id: $id) {
    community {
      id
      name
      contractAddress
    }
    id
    createdDate
    balanceBlockTag
    status
    title
    description
    fundingAmount
    currencyType
    numWinners
    startTime
    proposalEndTime
    votingEndTime
    proposals {
      id
      address
      title
      tldr
      voteCount
      createdDate
    }
  }
}`;
