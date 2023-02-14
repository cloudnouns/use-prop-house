import React, { useEffect, useMemo, useState } from 'react';
import type { BaseHouse } from '../types';
import Dispatcher from '../utils/dispatcher';
import { fetchDataByQuery, slug, timestamp, url } from '../utils';

export const usePropHouses = () => {
	const [houses, setHouses] = useState<BaseHouse[]>([]);
	const [error, setError] = useState<string>('');
	const [isLoading, setIsLoading] = useState<boolean>(true);

	const dispatch = useMemo(() => {
		return new Dispatcher<BaseHouse[]>(setHouses, setIsLoading, setError);
	}, []);

	useEffect(() => {
		dispatch.reset();

		const getData = async () => {
			const response = await fetchDataByQuery(query);
			const { data, error } = formatData(response, []);
			if (error) dispatch.err(error, data);
			else dispatch.update(data);
		};

		getData();
	}, [dispatch]);

	return { data: houses, error, isLoading };
};

const formatData = (
	data: any,
	fallback: BaseHouse[]
): { data: BaseHouse[]; error?: string } => {
	if (!data) return { data: fallback, error: 'query_failed' };

	const { data: result, errors: error } = data;
	const houses: any[] = result?.communities ?? [];

	if (error) return { data: fallback, error: JSON.stringify(error) };

	const formattedHouses = houses?.map((house: any): BaseHouse => {
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
