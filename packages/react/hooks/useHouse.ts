import React, { useEffect, useState } from 'react';
import type { FullHouse } from '../types';
import { fetchDataByQuery, slug, timestamp } from '../utils';

type UseHouseConfig = {
	id: number;
};

export const useHouse = ({ id }: UseHouseConfig): FullHouse | undefined => {
	if (!id) return;

	const [houseData, setHouseData] = useState<FullHouse>();

	useEffect(() => {
		const getData = async () => {
			const data = await fetchDataByQuery(query, { id });
			if (!data) {
				setHouseData(undefined);
				return;
			}
			setHouseData(formatData(data));
		};

		if (id) getData();
		else setHouseData(undefined);
	}, [id]);

	return houseData;
};

const formatData = (data: any): FullHouse | undefined => {
	const { data: result, error } = data;
	const house = result?.community;

	if (error) {
		// console.error(error);
		return;
	}

	const rounds = house?.auctions?.map((round: any) => round);
	for (const round of rounds) {
		// fix typo in Nouns round from ' ETH' to 'ETH'
		if (round.currencyType) round.currencyType = round.currencyType.trim();
	}

	const currencies: string[] = Array.from(
		new Set(rounds.map((round: any) => round?.currencyType))
	);

	const funding = currencies.map((currency) => {
		const filteredRounds = rounds.filter(
			(round: any) => round?.currencyType === currency
		);
		return {
			currency,
			amount:
				filteredRounds
					.map((round: any) => round?.fundingAmount * round?.numWinners)
					.reduce((a: number, b: number) => a + b, 0) ?? 0,
			rounds: filteredRounds.length,
		};
	});

	return {
		id: house?.id ?? -1,
		created: timestamp(house?.createdDate),
		name: house?.name ?? '',
		slug: slug(house?.name),
		url: 'https://prop.house/' + slug(house?.name),
		description: house?.description ?? '',
		imageUrl: house?.profileImageUrl ?? '',
		contract: house?.contractAddress ?? '',
		rounds: rounds.map((round: any) => round?.id) ?? [],
		totalProposals:
			rounds
				.map((round: any) => round?.proposals?.length ?? 0)
				?.reduce((a: number, b: number) => a + b, 0) ?? 0,
		funding,
	};
};

const query = `query GetHouseById($id: Int!) {
  community(id: $id) {
    id
    name
    contractAddress
    createdDate
    description
    profileImageUrl
    auctions {
      id
      fundingAmount
      currencyType
      numWinners
      proposals {
        id
      }
    }
  }
}`;
