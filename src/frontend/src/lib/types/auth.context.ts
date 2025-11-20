import type { SatelliteDid } from '$declarations';
import type { Readable } from 'svelte/store';

export interface AuthConfigData {
	rule?: { result: 'success' | 'error' | 'skip'; rule?: SatelliteDid.Rule | undefined };
	config?: {
		result: 'success' | 'error' | 'skip';
		config?: SatelliteDid.AuthenticationConfig | undefined;
	};
}

export interface AuthConfigContext {
	setConfig: (result: {
		result: 'success' | 'error' | 'skip';
		config?: SatelliteDid.AuthenticationConfig | undefined;
	}) => void;
	setRule: (result: {
		result: 'success' | 'error' | 'skip';
		rule?: SatelliteDid.Rule | undefined;
	}) => void;

	config: Readable<SatelliteDid.AuthenticationConfig | undefined>;
	rule: Readable<SatelliteDid.Rule | undefined>;
	supportSettings: Readable<boolean>;
	supportConfig: Readable<boolean>;

	state: Readable<'loading' | 'initialized' | 'error'>;
}

export const AUTH_CONFIG_CONTEXT_KEY = Symbol('auth-config');
