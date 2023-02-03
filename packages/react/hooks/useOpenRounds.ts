import React, { useEffect, useState } from 'react';
import type { Round } from '../types';
import { roundsByStatus } from '../utils/fetchRoundByStatus';

export const useOpenRounds = (): Round[] | undefined => {
	const [roundData, setRoundData] = useState<Round[]>();

	useEffect(() => {
		const getData = async () => {
			const data = await roundsByStatus('Open');
			if (!data) setRoundData([]);
			else setRoundData(data);
		};

		getData();
	}, []);

	return roundData;
};
