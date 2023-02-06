import React, { useEffect, useState } from 'react';
import type { Round } from '../types';
import Dispatcher from '../utils/dispatcher';
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
	const [rounds, setRounds] = useState<Round[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [isError, setIsError] = useState<boolean>(false);
	const [error, setError] = useState<string>('');

	const dispatch = new Dispatcher<Round[]>(
		setRounds,
		setIsLoading,
		setIsError,
		setError
	);

	useEffect(() => {
		dispatch.reset();

		const getData = async (status: string) => {
			status = status.charAt(0).toUpperCase() + status.slice(1);
			const response = await fetchDataByQuery(query, { status, limit, offset });
			const { data, error } = formatData(response, []);
			if (error) dispatch.err(error, data);
			else dispatch.update(data);
		};

		if (status && typeof status === 'string') getData(status);
		else dispatch.err('invalid_status', []);
	}, [status, limit, offset]);

	return { rounds, isLoading, isError, error };
};

const formatData = (
	data: any,
	fallback: Round[]
): { data: Round[]; error?: string } => {
	if (!data) return { data: fallback, error: 'query_failed' };

	const { data: result, errors: error } = data;
	const rounds = result?.auctionsByStatus;

	if (error) return { data: fallback, error: JSON.stringify(error) };

	const formattedRounds = rounds?.map((round: any) => {
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

	return { data: formattedRounds };
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
