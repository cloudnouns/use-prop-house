import React, { useEffect, useState } from 'react';
import type { House } from '../types';
import { fetchDataByQuery, slug, timestamp, url } from '../utils';

export const usePropHouses = () => {
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [houses, setHouses] = useState<House[]>([]);

	useEffect(() => {
		setIsLoading(true);

		const getData = async () => {
			const data = await fetchDataByQuery(query);
			const clean = formatData(data);
			if (!clean) setHouses([]);
			else setHouses(clean);
			setIsLoading(false);
		};

		getData();
	}, []);

	return { isLoading, houses };
};

const formatData = (data: any): House[] | undefined => {
	if (!data) return;

	const { data: result, error } = data;
	const houses: any[] = result?.communities ?? [];

	if (error) {
		// console.error(error);
		return;
	}

	return houses?.map((house: any): House => {
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
