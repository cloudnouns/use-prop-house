import type { Round } from '../types';
import { fetchDataByQuery, slug, timestamp } from '.';

export const roundsByStatus = async (
	status: 'Upcoming' | 'Open' | 'Voting'
) => {
	if (!status) return undefined;
	const data = await fetchDataByQuery(query, { status });
	if (!data) return undefined;
	return formatRounds(data);
};

const formatRounds = (data: any): Round[] | undefined => {
	const { data: result, error } = data;
	const rounds = result?.auctionsByStatus;

	if (error) {
		// console.error(error);
		return;
	}

	return rounds?.map((round: any) => {
		return {
			house: {
				id: round?.community?.id ?? -1,
				name: round?.community?.name ?? '',
				slug: slug(round?.community?.name),
				url: 'https://prop.house/' + slug(round?.community?.name),
				contract: round?.community?.contractAddress ?? '',
			},
			snapshotBlock: Number(round?.balanceBlockTag) ?? -1,
			id: round?.id ?? -1,
			created: timestamp(round?.createdDate),
			status: round?.status ?? '',
			name: round?.title ?? '',
			slug: slug(round?.title),
			description: round?.description ?? '',
			url: `https://prop.house/${slug(round?.community?.name)}/${slug(
				round?.title
			)}`,
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
						url: 'https://prop.house/proposal/' + prop?.id,
						votes: prop?.voteCount ?? 0,
					};
				}) ?? [],
		};
	});
};

const query = `query GetRoundByStatus($status: AuctionStatus!) {
  auctionsByStatus(status: $status) {
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
