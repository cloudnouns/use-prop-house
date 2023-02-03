import React, { useEffect, useState } from 'react';
import type { House } from '../types';
import { fetchDataByQuery, slug, timestamp } from '../utils';

export const useHouses = (): House[] => {
	const [houses, setHouses] = useState<House[]>([]);

	useEffect(() => {
		const getData = async () => {
			const data = await fetchDataByQuery(query);
			if (!data) setHouses([]);
			else {
				const clean = formatData(data);
				if (!clean) setHouses([]);
				else setHouses(clean);
			}
		};

		getData();
	}, []);

	return houses;
};

const formatData = (data: any): House[] | undefined => {
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
			url: 'https://prop.house/' + slug(house?.name),
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
