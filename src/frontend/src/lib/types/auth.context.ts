import type { SatelliteDid } from '$declarations';
import type { Option } from '$lib/types/utils';
import type { Readable } from 'svelte/store';

export interface AuthConfigData {
	rule?: { result: 'success' | 'error' | 'skip'; rule?: SatelliteDid.Rule | undefined };
}

export interface AuthConfigContext {
	setRule: (result: {
		result: 'success' | 'error' | 'skip';
		rule?: SatelliteDid.Rule | undefined;
	}) => void;

	config: Readable<Option<SatelliteDid.AuthenticationConfig>>;
	rule: Readable<SatelliteDid.Rule | undefined>;
	supportSettings: Readable<boolean>;
	supportConfig: Readable<boolean>;

	state: Readable<'loading' | 'initialized' | 'error'>;
}

export const AUTH_CONFIG_CONTEXT_KEY = Symbol('auth-config');
