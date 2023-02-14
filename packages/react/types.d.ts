export type BaseHouse = {
	created: number;
	id: number;
	name: string;
	slug: string;
	url: string;
	description: string;
	contract: string;
	imageUrl: string;
};

export interface House extends BaseHouse {
	rounds: number[];
	totalProposals: number;
	funding: {
		currency: string;
		amount: number;
		rounds: number;
	}[];
}

export type Round = {
	house: {
		id: number;
		name: string;
		slug: string;
		url: string;
		contract: string;
	};
	snapshotBlock: number;
	id: string;
	created: number;
	status: string;
	name: string;
	slug: string;
	description: string;
	url: string;
	funding: {
		amount: number;
		currency: string;
		winners: number;
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
		url: string;
		votes: number;
	}[];
};

export type Proposal = {
	round: {
		id: number;
		name: string;
		status: string;
	};
	id: number;
	url: string;
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
