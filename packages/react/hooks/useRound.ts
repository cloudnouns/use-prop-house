import React, { useEffect, useState } from 'react';
import type { Round } from '../types';
import { fetchDataByQuery, timestamp } from '../utils';

type UseRoundConfig = {
	id: number;
};

export const useRound = ({ id }: UseRoundConfig): Round | undefined => {
	if (!id) return;

	const [roundData, setRoundData] = useState<Round>();

	useEffect(() => {
		const getData = async () => {
			const data = await fetchDataByQuery(query, { id });
			if (!data) {
				setRoundData(undefined);
				return;
			}
			setRoundData(formatData(data));
		};

		if (id) getData();
		else setRoundData(undefined);
	}, [id]);

	return roundData;
};

const formatData = (data: any): Round | undefined => {
	const { data: result, error } = data;
	const round = result?.auction;

	if (error) {
		// console.error(error);
		return;
	}

	return {
		houseId: round?.community?.id ?? -1,
		contract: round?.community?.contractAddress ?? '',
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
};

const query = `query GetRoundById($id: Int!) {
  auction(id: $id) {
    community {
      id
      contractAddress
    }
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
}`;
