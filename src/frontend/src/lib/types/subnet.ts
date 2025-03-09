import type { PrincipalText } from '@dfinity/zod-schemas';

export interface SubnetMetadata {
	type: 'application' | string;
	canisters: {
		stopped: number;
		running: number;
	};
	nodes: {
		up: number;
		total: number;
	};
}

export type Subnet = {
	subnetId: PrincipalText;
	specialization?: 'european' | 'fiduciary' | string;
} & Partial<SubnetMetadata>;
