import type { Satellite } from '$declarations/mission_control/mission_control.did';
import { initDataStore } from '$lib/stores/data.store';
import type { Option } from '$lib/types/utils';

type SatellitesStoreData = Option<Satellite[]>;
export const satellitesStore = initDataStore<SatellitesStoreData>();
