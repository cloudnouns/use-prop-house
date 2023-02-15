import React, { useEffect, useMemo, useState } from 'react';
import type { Round } from '../types';
import Dispatcher from '../utils/dispatcher';
import { fetchDataByQuery, slug, timestamp, url } from '../utils';

type Status = 'upcoming' | 'open' | 'voting' | 'closed';

type UseRoundsByHouseConfig = {
	houseId: number;
	status?: Status | Status[];
};

export const useRoundsByHouse = ({
	houseId,
	status,
}: UseRoundsByHouseConfig) => {
	const [rounds, setRounds] = useState<Round[]>([]);
	const [error, setError] = useState<string>('');
	const [isLoading, setIsLoading] = useState<boolean>(true);

	const dispatch = useMemo(() => {
		return new Dispatcher<Round[]>(setRounds, setIsLoading, setError);
	}, []);

	useEffect(() => {
		dispatch.reset();

		const getData = async () => {
			const response = await fetchDataByQuery(query, { id: houseId });
			const { data, error } = formatData(response, []);
			if (error) setRounds(data);
			else {
				let rounds = data;
				if (status) {
					rounds = data.filter((r) => {
						if (Array.isArray(status)) {
							return status.includes(r.status.toLowerCase() as Status);
						}
						return status === r.status.toLowerCase();
					});
				}
				dispatch.update(rounds);
			}
		};

		if (houseId) getData();
		else dispatch.err('invalid_id', []);
	}, [houseId, JSON.stringify(status), dispatch]);

	return { data: rounds, error, isLoading };
};

const formatData = (
	data: any,
	fallback: Round[]
): { data: Round[]; error?: string } => {
	if (!data) return { data: fallback, error: 'query_failed' };

	const { data: result, errors: error } = data;
	const rounds = result?.community?.auctions ?? [];

	if (error) return { data: fallback, error: JSON.stringify(error) };

	const formattedRounds: Round[] = rounds.map((round: any) => {
		const formattedRound: Round = {
			house: {
				id: result?.community?.id ?? -1,
				name: result?.community?.name ?? '',
				slug: slug(result?.community?.name),
				url: url([result?.community?.name]),
				contract: result?.community?.contractAddress ?? '',
			},
			snapshotBlock: Number(round?.balanceBlockTag) ?? -1,
			id: round?.id ?? -1,
			created: timestamp(round?.createdDate),
			status: round?.status ?? '',
			name: round?.title ?? '',
			slug: slug(round?.title),
			description: round?.description ?? '',
			url: url([result?.community?.name, round?.title]),
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
						isWinner: false,
					};
				}) ?? [],
		};

		if (Date.now() >= formattedRound.proposalDeadline) {
			formattedRound.proposals = formattedRound.proposals.sort(
				(a, b) => b.votes - a.votes
			);
		}

		// mark winners
		if (Date.now() >= formattedRound.voteDeadline) {
			const winners = formattedRound.proposals.slice(
				0,
				formattedRound.funding.winners
			);
			for (const winner of winners) {
				winner.isWinner = true;
			}
		}

		return formattedRound;
	});

	return { data: formattedRounds };
};

const query = `query GetRoundsByHouseId($id: Int!) {
  community(id: $id) {
		id
		name
    contractAddress
    auctions {
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
  }
}`;
