import React, { useEffect, useState } from 'react';
import type { Round } from '../types';
import { fetchDataByQuery, slug, timestamp, url } from '../utils';

type UseRoundsByHouseConfig = {
	houseId: number;
	status?: 'upcoming' | 'open' | 'voting' | 'closed';
};

export const useRoundsByHouse = ({
	houseId,
	status,
}: UseRoundsByHouseConfig) => {
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [rounds, setRounds] = useState<Round[]>([]);

	useEffect(() => {
		setIsLoading(true);

		const getData = async () => {
			const data = await fetchDataByQuery(query, { id: houseId });
			const clean = formatData(data);
			if (!clean) setRounds([]);
			else if (status) {
				const filteredRounds = clean.filter((r) => {
					return status === r.status.toLowerCase();
				});
				setRounds(filteredRounds);
			} else setRounds(clean);

			setIsLoading(false);
		};

		if (houseId) getData();
		else {
			setRounds([]);
			setIsLoading(false);
		}
	}, [houseId, status]);

	return { isLoading, rounds };
};

const formatData = (data: any): Round[] | undefined => {
	if (!data) return;

	const { data: result, error } = data;
	const rounds = result?.community?.auctions ?? [];

	if (error) {
		// console.error(error);
		return;
	}

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

	return formattedRounds ?? [];
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
