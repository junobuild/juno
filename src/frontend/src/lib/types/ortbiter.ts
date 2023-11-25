import type { OrbiterSatelliteConfig as SatelliteConfig } from '$declarations/orbiter/orbiter.did';

export interface PageViewsPeriod {
	from?: Date;
	to?: Date;
}

export interface OrbiterSatelliteConfigEntry {
	name: string;
	enabled: boolean;
	config?: SatelliteConfig;
}
