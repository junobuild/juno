import type { ActorMethod } from '@dfinity/agent';
import type { Principal } from '@dfinity/principal';

export interface ControllersArgs {
	controllers: Array<Principal>;
}
export interface CreateSatelliteArgs {
	block_index: [] | [bigint];
	user: Principal;
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
export interface RateConfig {
	max_tokens: bigint;
	time_per_token_ns: bigint;
}
export interface ReleasesVersion {
	satellite: [] | [string];
	mission_control: [] | [string];
}
export type Segment = { MissionControl: null } | { Satellite: null };
export interface Tokens {
	e8s: bigint;
}
export interface _SERVICE {
	add_controllers: ActorMethod<[ControllersArgs], undefined>;
	add_invitation_code: ActorMethod<[string], undefined>;
	create_satellite: ActorMethod<[CreateSatelliteArgs], Principal>;
	get_create_satellite_fee: ActorMethod<[GetCreateSatelliteFeeArgs], [] | [Tokens]>;
	get_credits: ActorMethod<[], Tokens>;
	get_releases_version: ActorMethod<[], ReleasesVersion>;
	get_user_mission_control_center: ActorMethod<[], [] | [MissionControl]>;
	init_user_mission_control_center: ActorMethod<[[] | [string]], MissionControl>;
	list_user_mission_control_centers: ActorMethod<[], Array<[Principal, MissionControl]>>;
	load_release: ActorMethod<[Segment, Uint8Array | number[], string], LoadRelease>;
	remove_controllers: ActorMethod<[ControllersArgs], undefined>;
	reset_release: ActorMethod<[Segment], undefined>;
	update_rate_config: ActorMethod<[Segment, RateConfig], undefined>;
	version: ActorMethod<[], string>;
}
