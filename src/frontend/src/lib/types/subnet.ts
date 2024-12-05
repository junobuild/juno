import type { PrincipalText } from '$lib/types/itentity';

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
