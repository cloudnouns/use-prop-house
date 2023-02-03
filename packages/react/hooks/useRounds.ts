import React, { useEffect, useState } from 'react';
import type { Round } from '../types';
import { fetchDataByQuery, timestamp } from '../utils';

type UseRoundConfig = {
	houseId: number;
};

export const useRounds = ({ houseId }: UseRoundConfig): Round[] => {
	if (!houseId) return [];

	const [rounds, setRounds] = useState<Round[]>([]);

	useEffect(() => {
		const getData = async () => {
			const data = await fetchDataByQuery(query, { id: houseId });
			if (!data) {
				setRounds([]);
				return;
			} else {
				const clean = formatData(data);
				if (!clean) setRounds([]);
				else setRounds(clean);
			}
		};

		if (houseId) getData();
		else setRounds([]);
	}, [houseId]);

	return rounds;
};

const formatData = (data: any): Round[] | undefined => {
	const { data: result, error } = data;
	const rounds = result?.community?.auctions ?? [];

	if (error) {
		// console.error(error);
		return;
	}

	const formattedRounds: Round[] = rounds.map((round: any) => {
		return {
			houseId: result?.community?.id ?? -1,
			contract: result?.community?.contractAddress ?? '',
			snapshotBlock: Number(round?.balanceBlockTag) ?? -1,
			id: round?.id ?? -1,
			created: timestamp(round?.createdDate),
			status: round?.status ?? '',
			name: round?.title ?? '',
			description: round?.description ?? '',
			winners: round?.numWinners ?? 0,
			funding: {
				amount: round?.fundingAmount ?? 0,
				currency: round?.currencyType?.trim() ?? '',
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
						votes: prop?.voteCount ?? 0,
					};
				}) ?? [],
		};
	});

	return formattedRounds ?? [];
};

const query = `query GetRoundsByHouseId($id: Int!) {
  community(id: $id) {
		id
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
