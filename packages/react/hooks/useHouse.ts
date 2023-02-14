import React, { useEffect, useMemo, useState } from 'react';
import type { House } from '../types';
import Dispatcher from '../utils/dispatcher';
import { fetchDataByQuery, slug, timestamp, url } from '../utils';

type UseHouseConfig = {
	id: number;
};

const emptyHouse = {} as House;

export const useHouse = ({ id }: UseHouseConfig) => {
	const [house, setHouse] = useState<House>(emptyHouse);
	const [error, setError] = useState<string>('');
	const [isLoading, setIsLoading] = useState<boolean>(true);

	const dispatch = useMemo(() => {
		return new Dispatcher<House>(setHouse, setIsLoading, setError);
	}, []);

	useEffect(() => {
		dispatch.reset();

		const getData = async () => {
			const response = await fetchDataByQuery(query, { id });
			const { data, error } = formatData(response, emptyHouse);
			if (error) dispatch.err(error, emptyHouse);
			else dispatch.update(data);
		};

		if (Number.isInteger(id) && id > 0) getData();
		else dispatch.err('invalid_id', emptyHouse);
	}, [id, dispatch]);

	return { data: house, error, isLoading };
};

const formatData = (
	data: any,
	fallback: House
): { data: House; error?: string } => {
	if (!data) return { data: fallback, error: 'query_failed' };

	const { data: result, errors: error } = data;
	const house = result?.community;

	if (error) return { data: fallback, error: JSON.stringify(error) };

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

	const formattedHouse: House = {
		id: house?.id ?? -1,
		created: timestamp(house?.createdDate),
		name: house?.name ?? '',
		slug: slug(house?.name),
		url: url([house?.name]),
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

	return { data: formattedHouse };
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
