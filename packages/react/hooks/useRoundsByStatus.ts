import React, { useEffect, useState } from 'react';
import type { Round } from '../types';
import { fetchDataByQuery, slug, timestamp, url } from '../utils';

type UseRoundsByStatusConfig = {
	status: 'upcoming' | 'open' | 'voting' | 'closed';
	limit?: number;
	offset?: number;
};

export const useRoundsByStatus = ({
	status,
	limit = 10,
	offset = 0,
}: UseRoundsByStatusConfig) => {
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [rounds, setRounds] = useState<Round[]>([]);

	useEffect(() => {
		setIsLoading(true);

		const getData = async (status: string) => {
			status = status.charAt(0).toUpperCase() + status.slice(1);
			const data = await fetchDataByQuery(query, { status, limit, offset });
			const clean = formatData(data);
			if (!clean) setRounds([]);
			else setRounds(clean);
			setIsLoading(false);
		};

		if (status && typeof status === 'string') getData(status);
		else {
			setRounds([]);
			setIsLoading(false);
		}
	}, [status, limit, offset]);

	return { isLoading, rounds };
};

const formatData = (data: any): Round[] | undefined => {
	if (!data) return;

	const { data: result, error: errors } = data;
	const rounds = result?.auctionsByStatus;

	if (errors) {
		// console.error(errors);
		return;
	}

	return rounds?.map((round: any) => {
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
	});
};

const query = `query GetRoundByStatus($status: AuctionStatus!, $limit: Int, $offset: Int) {
  auctionsByStatus(status: $status, limit: $limit, offset: $offset) {
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
