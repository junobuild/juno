import type {Option} from "$lib/types/utils";
import type {Satellite} from "$declarations/mission_control/mission_control.did";
import {initDataStore} from "$lib/stores/data.store";

type SatellitesStoreData = Option<Satellite[]>;
export const satellitesDataStore = initDataStore<SatellitesStoreData>();