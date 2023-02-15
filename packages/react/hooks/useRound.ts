import React, { useEffect, useMemo, useState } from 'react';
import type { Round } from '../types';
import Dispatcher from '../utils/dispatcher';
import { fetchDataByQuery, slug, timestamp, url } from '../utils';

type UseRoundConfig = {
	id: number;
};

const emptyRound = {} as Round;

export const useRound = ({ id }: UseRoundConfig) => {
	const [round, setRound] = useState<Round>();
	const [error, setError] = useState<string>('');
	const [isLoading, setIsLoading] = useState<boolean>(true);

	const dispatch = useMemo(() => {
		return new Dispatcher<Round>(setRound, setIsLoading, setError);
	}, []);

	useEffect(() => {
		dispatch.reset();

		const getData = async () => {
			const response = await fetchDataByQuery(query, { id });
			const { data, error } = formatData(response, emptyRound);
			if (error) dispatch.err(error, data);
			else dispatch.update(data);
		};

		if (id) getData();
		else dispatch.err('invalid_id', emptyRound);
	}, [id, dispatch]);

	return { data: round, error, isLoading };
};

const formatData = (
	data: any,
	fallback: Round
): { data: Round; error?: string } => {
	if (!data) return { data: fallback, error: 'query_failed' };

	const { data: result, errors: error } = data;
	const round = result?.auction;

	if (error) return { data: fallback, error: JSON.stringify(error) };

	const formattedRound: Round = {
		house: {
			id: round?.community?.id ?? -1,
			name: round?.community?.name ?? '',
			slug: slug(round?.community?.name),
			url: url([round?.community?.name]),
			contract: round?.community?.contractAddress ?? '',
		},
		snapshotBlock: Number(round?.balanceBlockTag) ?? -1,
		id: round?.id ?? -1,
		created: timestamp(round?.createdDate),
		status: round?.status ?? '',
		name: round?.title ?? '',
		slug: slug(round?.title),
		description: round?.description ?? '',
		url: url([round?.community?.name, round?.title]),
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
					url: url(['proposal', String(prop?.id)]),
					votes: prop?.voteCount ?? 0,
					isWinner: false,
				};
			}) ?? [],
	};

	if (Date.now() >= formattedRound.proposalDeadline) {
		formattedRound.proposals = formattedRound.proposals.sort(
			(a, b) => b.votes - a.votes
		);
	}

	// mark winners
	if (Date.now() >= formattedRound.voteDeadline) {
		const winners = formattedRound.proposals.slice(
			0,
			formattedRound.funding.winners
		);
		for (const winner of winners) {
			winner.isWinner = true;
		}
	}

	return { data: formattedRound };
};

const query = `query GetRoundById($id: Int!) {
  auction(id: $id) {
    community {
      id
      name
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
