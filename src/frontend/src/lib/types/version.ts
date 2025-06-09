import type { OptionIdentity } from '$lib/types/itentity';
import type { BuildType } from '@junobuild/admin';
import type { JunoPackage } from '@junobuild/config';

export interface VersionMetadata {
	release: string;
	/**
	 * The version of the module as published by Juno and required in the eco-system.
	 *
	 * For the Satellite, if stock (no dependencies), then pkg.version
	 * If serverless functions, then pkg.dependencies[junobuild/satellite].version
	 */
	current: string;
	pkg?: JunoPackage;
}

export interface SatelliteVersionMetadata extends VersionMetadata {
	/**
	 * @deprecated use JunoPackage instead
	 */
	currentBuild?: string;
	/**
	 * @deprecated use JunoPackage instead
	 */
	build: BuildType;
}

export interface LoadVersionBaseParams {
	skipReload: boolean;
	identity: OptionIdentity;
	toastError?: boolean;
}

export type LoadVersionResult =
	| { result: 'loaded' }
	| { result: 'skipped' }
	| { result: 'error'; err: unknown };

export type VersionMetadataUi = VersionMetadata & {warning: boolean};
export type SatelliteVersionMetadataUi = SatelliteVersionMetadata & {warning: boolean};