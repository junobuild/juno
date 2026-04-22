import type { SatelliteDid } from '$declarations';

export const CONTROLLER_METADATA: Omit<SatelliteDid.SetAccessKey, 'scope'> = {
	expires_at: [],
	kind: [],
	metadata: []
};
