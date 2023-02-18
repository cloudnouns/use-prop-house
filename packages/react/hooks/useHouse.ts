import React, { useEffect, useMemo, useState } from 'react';
import type { House } from '../types';
import Dispatcher from '../utils/dispatcher';
import { fetchDataByQuery, slug, timestamp, url } from '../utils';

type UseHouseConfig =
	| { id: number; contract?: string }
	| { contract: string; id?: number };

const emptyHouse = {} as House;

export const useHouse = ({ id, contract }: UseHouseConfig) => {
	const [searchKey, setSearchKey] = useState<string | number>();
	const [house, setHouse] = useState<House>(emptyHouse);
	const [error, setError] = useState<string>('');
	const [isLoading, setIsLoading] = useState<boolean>(true);

	const dispatch = useMemo(() => {
		return new Dispatcher<House>(setHouse, setIsLoading, setError);
	}, []);

	useEffect(() => {
		if (typeof id !== 'number' && id !== 0 && !contract) {
			setSearchKey(undefined);
			dispatch.err('invalid_id_or_contract', emptyHouse);
		} else {
			// id takes precedence over contract
			if (Number.isInteger(id)) setSearchKey(id);
			else setSearchKey(contract);
		}
	}, [id, contract, dispatch]);

	useEffect(() => {
		dispatch.reset();

		const getData = async () => {
			let query = queryById;
			if (typeof searchKey === 'string') query = queryByContract;
			const response = await fetchDataByQuery(query, {
				id: searchKey,
				contract: searchKey,
			});
			const { data, error } = formatData(response, emptyHouse);
			if (error) dispatch.err(error, emptyHouse);
			else dispatch.update(data);
		};

		if (searchKey || Number.isInteger(searchKey)) getData();
		else if (typeof id !== 'number' && id !== 0 && !contract) {
			dispatch.err('invalid_id_or_contract', emptyHouse);
		}
	}, [searchKey, id, contract, dispatch]);

	return { data: house, error, isLoading };
};

const formatData = (
	data: any,
	fallback: House
): { data: House; error?: string } => {
	if (!data) return { data: fallback, error: 'query_failed' };

	const { data: result, errors: error } = data;
	const house = result?.community ?? result?.findByAddress;

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

const queryById = `query GetHouseById($id: Int!) {
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

const queryByContract = `query GetHouseByContract($contract: String!) {
  findByAddress(address: $contract) {
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
