import type { ActorMethod } from '@dfinity/agent';
import type { Principal } from '@dfinity/principal';

export interface ObservatoryAddMissionControlArgs {
	mission_control_id: Principal;
	owner: Principal;
}
export interface _SERVICE {
	add_mission_control: ActorMethod<[ObservatoryAddMissionControlArgs], undefined>;
	version: ActorMethod<[], string>;
}
