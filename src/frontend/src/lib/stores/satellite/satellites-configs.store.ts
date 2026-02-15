import type { SatelliteDid } from '$declarations';
import { initPerCertifiedCanisterStore } from '$lib/stores/_certified-canister.store';

export const uncertifiedSatellitesConfigsStore =
	initPerCertifiedCanisterStore<SatelliteDid.Config>();
