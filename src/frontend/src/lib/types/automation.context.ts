import type { SatelliteDid } from '$declarations';
import type { Readable } from 'svelte/store';

export interface AutomationConfigData {
	config?: {
		result: 'success' | 'error' | 'skip';
		config?: SatelliteDid.AutomationConfig | undefined;
	};
}

export interface AutomationConfigContext {
	setConfig: (result: {
		result: 'success' | 'error' | 'skip';
		config?: SatelliteDid.AutomationConfig | undefined;
	}) => void;

	config: Readable<SatelliteDid.AutomationConfig | undefined>;

	supportConfig: Readable<boolean>;

	state: Readable<'loading' | 'initialized' | 'error'>;
}

export const AUTOMATION_CONFIG_CONTEXT_KEY = Symbol('automation-config');
