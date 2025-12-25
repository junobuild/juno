import type { Principal } from '@icp-sdk/core/principal';

export interface CreateWithConfig {
	subnetId?: Principal;
}

export interface CreateWithConfigAndName extends CreateWithConfig {
	name?: string;
}

export interface CreateSatelliteConfig extends CreateWithConfig {
	name: string;
	kind: 'website' | 'application';
}
