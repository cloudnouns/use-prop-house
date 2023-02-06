import React, { useEffect, useState } from 'react';
import type { House } from '../types';
import Dispatcher from '../utils/dispatcher';
import { fetchDataByQuery, slug, timestamp, url } from '../utils';

export const usePropHouses = () => {
	const [houses, setHouses] = useState<House[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [isError, setIsError] = useState<boolean>(false);
	const [error, setError] = useState<string>('');

	const dispatch = new Dispatcher<House[]>(
		setHouses,
		setIsLoading,
		setIsError,
		setError
	);

	useEffect(() => {
		dispatch.reset();

		const getData = async () => {
			const response = await fetchDataByQuery(query);
			const { data, error } = formatData(response, []);
			if (error) dispatch.err(error, data);
			else dispatch.update(data);
		};

		getData();
	}, []);

	return { houses, isLoading, isError, error };
};

const formatData = (
	data: any,
	fallback: House[]
): { data: House[]; error?: string } => {
	if (!data) return { data: fallback, error: 'query_failed' };

	const { data: result, errors: error } = data;
	const houses: any[] = result?.communities ?? [];

	if (error) return { data: fallback, error: JSON.stringify(error) };

	const formattedHouses = houses?.map((house: any): House => {
		return {
			id: house?.id ?? -1,
			created: timestamp(house?.createdDate),
			name: house?.name ?? '',
			slug: slug(house?.name),
			url: url([house?.name]),
			description: house?.description ?? '',
			imageUrl: house?.profileImageUrl ?? '',
			contract: house?.contractAddress ?? '',
		};
	});

	return { data: formattedHouses };
};

const query = `query GetAllHouses {
  communities {
    createdDate
    id
    name
    description
    contractAddress
    profileImageUrl
  }
}`;
