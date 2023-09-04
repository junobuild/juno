import type { ActorMethod } from '@dfinity/agent';
import type { Principal } from '@dfinity/principal';

export interface AnalyticKey {
	key: string;
	session_id: string;
	satellite_id: Principal;
}
export interface Controller {
	updated_at: bigint;
	metadata: Array<[string, string]>;
	created_at: bigint;
	scope: ControllerScope;
	expires_at: [] | [bigint];
}
export type ControllerScope = { Write: null } | { Admin: null };
export interface DelSatelliteConfig {
	updated_at: [] | [bigint];
}
export interface DeleteControllersArgs {
	controllers: Array<Principal>;
}
export interface GetAnalytics {
	to: [] | [bigint];
	from: [] | [bigint];
	satellite_id: [] | [Principal];
}
export interface PageView {
	title: string;
	updated_at: bigint;
	referrer: [] | [string];
	time_zone: string;
	href: string;
	created_at: bigint;
	device: PageViewDevice;
	user_agent: [] | [string];
	collected_at: bigint;
}
export interface PageViewDevice {
	inner_height: number;
	inner_width: number;
}
export type Result = { Ok: PageView } | { Err: string };
export type Result_1 = { Ok: null } | { Err: Array<[AnalyticKey, string]> };
export type Result_2 = { Ok: TrackEvent } | { Err: string };
export interface SatelliteConfig {
	updated_at: bigint;
	created_at: bigint;
	enabled: boolean;
}
export interface SetController {
	metadata: Array<[string, string]>;
	scope: ControllerScope;
	expires_at: [] | [bigint];
}
export interface SetControllersArgs {
	controller: SetController;
	controllers: Array<Principal>;
}
export interface SetPageView {
	title: string;
	updated_at: [] | [bigint];
	referrer: [] | [string];
	time_zone: string;
	href: string;
	device: PageViewDevice;
	user_agent: [] | [string];
	collected_at: bigint;
}
export interface SetSatelliteConfig {
	updated_at: [] | [bigint];
	enabled: boolean;
}
export interface SetTrackEvent {
	updated_at: [] | [bigint];
	metadata: [] | [Array<[string, string]>];
	name: string;
	user_agent: [] | [string];
	collected_at: bigint;
}
export interface TrackEvent {
	updated_at: bigint;
	metadata: [] | [Array<[string, string]>];
	name: string;
	created_at: bigint;
	collected_at: bigint;
}
export interface _SERVICE {
	del_controllers: ActorMethod<[DeleteControllersArgs], Array<[Principal, Controller]>>;
	del_satellite_config: ActorMethod<[Principal, DelSatelliteConfig], undefined>;
	get_page_views: ActorMethod<[GetAnalytics], Array<[AnalyticKey, PageView]>>;
	get_track_events: ActorMethod<[GetAnalytics], Array<[AnalyticKey, TrackEvent]>>;
	list_controllers: ActorMethod<[], Array<[Principal, Controller]>>;
	list_satellite_configs: ActorMethod<[], Array<[Principal, SatelliteConfig]>>;
	set_controllers: ActorMethod<[SetControllersArgs], Array<[Principal, Controller]>>;
	set_page_view: ActorMethod<[AnalyticKey, SetPageView], Result>;
	set_page_views: ActorMethod<[Array<[AnalyticKey, SetPageView]>], Result_1>;
	set_satellite_configs: ActorMethod<
		[Array<[Principal, SetSatelliteConfig]>],
		Array<[Principal, SatelliteConfig]>
	>;
	set_track_event: ActorMethod<[AnalyticKey, SetTrackEvent], Result_2>;
	set_track_events: ActorMethod<[Array<[AnalyticKey, SetTrackEvent]>], Result_1>;
	version: ActorMethod<[], string>;
}
