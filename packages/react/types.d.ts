export type House = {
	created: number;
	id: number;
	name: string;
	description: string;
	contract: string;
	imageUrl: string;
};

export interface FullHouse extends House {
	rounds: number[];
	totalProposals: number;
	funding: {
		currency: string;
		amount: number;
		rounds: number;
	}[];
}

export type Round = {
	houseId: number;
	contract: string;
	snapshotBlock: number;
	id: string;
	created: number;
	status: string;
	name: string;
	description: string;
	winners: number;
	funding: {
		amount: number;
		currency: string;
	};
	startTime: number;
	proposalDeadline: number;
	voteDeadline: number;
	proposals: {
		proposer: string;
		id: number;
		created: number;
		title: string;
		summary: string;
		votes: number;
	}[];
};

export type Proposal = {
	roundId: number;
	id: number;
	created: number;
	proposer: string;
	title: string;
	summary: string;
	content: string;
	voteCount: number;
	votes: {
		created: number;
		voter: string;
		weight: number;
	}[];
	url: string;
};

export type Vote = {
	created: number;
	voter: string;
	weight: number;
	proposal: {
		id: number;
		title: string;
		url: string;
	};
};
