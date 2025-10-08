import { idlFactory as idlFactoryMissionControl } from '$declarations/console/console.factory.did';
import { idlFactory as idlFactoryIC } from '@dfinity/ic-management/dist/candid/ic-management.idl';

import type { _SERVICE as MissionControlActor } from '$declarations/mission_control/mission_control.did';
import type { _SERVICE as ICActor } from '@dfinity/ic-management/dist/candid/ic-management';

export { idlFactoryIC, idlFactoryMissionControl, type ICActor, type MissionControlActor };
