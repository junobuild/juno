import type { SatelliteDid } from '$declarations';
import { initCertifiedCanisterStore } from '$lib/stores/_certified-canister.store';

export const uncertifiedSatellitesConfigsStore = initCertifiedCanisterStore<SatelliteDid.Config>();
