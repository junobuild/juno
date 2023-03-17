import type { ActorMethod } from '@dfinity/agent';
import type { Principal } from '@dfinity/principal';

export interface CreateSatelliteArgs {
	block_index: [] | [bigint];
	user: Principal;
}
export interface DeleteControllersArgs {
	controllers: Array<Principal>;
}
export interface GetCreateSatelliteFeeArgs {
	user: Principal;
}
export interface LoadRelease {
	total: bigint;
	chunks: bigint;
}
export interface MissionControl {
	updated_at: bigint;
	credits: Tokens;
	mission_control_id: [] | [Principal];
	owner: Principal;
	created_at: bigint;
}
export type ReleaseType = { MissionControl: null } | { Satellite: null };
export interface ReleasesVersion {
	satellite: [] | [string];
	mission_control: [] | [string];
}
export interface SetController {
	metadata: Array<[string, string]>;
	expires_at: [] | [bigint];
}
export interface SetControllersArgs {
	controller: SetController;
	controllers: Array<Principal>;
}
export interface Tokens {
	e8s: bigint;
}
export interface _SERVICE {
	add_invitation_code: ActorMethod<[string], undefined>;
	create_satellite: ActorMethod<[CreateSatelliteArgs], Principal>;
	del_controllers: ActorMethod<[DeleteControllersArgs], undefined>;
	get_create_satellite_fee: ActorMethod<[GetCreateSatelliteFeeArgs], [] | [Tokens]>;
	get_credits: ActorMethod<[], Tokens>;
	get_releases_version: ActorMethod<[], ReleasesVersion>;
	get_user_mission_control_center: ActorMethod<[], [] | [MissionControl]>;
	init_user_mission_control_center: ActorMethod<[[] | [string]], MissionControl>;
	list_user_mission_control_centers: ActorMethod<[], Array<[Principal, MissionControl]>>;
	load_release: ActorMethod<[ReleaseType, Uint8Array | number[], string], LoadRelease>;
	reset_release: ActorMethod<[ReleaseType], undefined>;
	set_controllers: ActorMethod<[SetControllersArgs], undefined>;
	version: ActorMethod<[], string>;
}
