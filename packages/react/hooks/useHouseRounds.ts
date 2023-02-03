import React, { useEffect, useState } from 'react';
import type { Round } from '../types';
import { fetchDataByQuery, slug, timestamp } from '../utils';

type UseHouseRoundsConfig = {
	houseId: number;
};

export const useHouseRounds = ({ houseId }: UseHouseRoundsConfig): Round[] => {
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
			house: {
				id: result?.community?.id ?? -1,
				name: result?.community?.name ?? '',
				slug: slug(result?.community?.name),
				url: 'https://prop.house/' + slug(result?.community?.name),
				contract: result?.community?.contractAddress ?? '',
			},
			snapshotBlock: Number(round?.balanceBlockTag) ?? -1,
			id: round?.id ?? -1,
			created: timestamp(round?.createdDate),
			status: round?.status ?? '',
			name: round?.title ?? '',
			slug: slug(round?.title),
			description: round?.description ?? '',
			url: `https://prop.house/${slug(result?.community?.name)}/${slug(
				round?.title
			)}`,
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
						url: 'https://prop.house/proposal/' + prop?.id,
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
