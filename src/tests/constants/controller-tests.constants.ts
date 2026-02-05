import type { SatelliteDid } from '$declarations';

export const CONTROLLER_METADATA: Omit<SatelliteDid.SetController, 'scope'> = {
	expires_at: [],
	kind: [],
	metadata: []
};
