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
export interface DelOriginConfig {
	updated_at: [] | [bigint];
}
export interface DeleteControllersArgs {
	controllers: Array<Principal>;
}
export interface GetPageViews {
	to: [] | [bigint];
	from: [] | [bigint];
	satellite_id: [] | [Principal];
}
export interface OriginConfig {
	key: Principal;
	updated_at: bigint;
	created_at: bigint;
	filter: string;
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
export type Result_1 = { Ok: null } | { Err: string };
export interface SetController {
	metadata: Array<[string, string]>;
	scope: ControllerScope;
	expires_at: [] | [bigint];
}
export interface SetControllersArgs {
	controller: SetController;
	controllers: Array<Principal>;
}
export interface SetOriginConfig {
	key: Principal;
	updated_at: [] | [bigint];
	filter: string;
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
export interface _SERVICE {
	del_controllers: ActorMethod<[DeleteControllersArgs], Array<[Principal, Controller]>>;
	del_origin_config: ActorMethod<[Principal, DelOriginConfig], undefined>;
	get_page_views: ActorMethod<[GetPageViews], Array<[AnalyticKey, PageView]>>;
	list_controllers: ActorMethod<[], Array<[Principal, Controller]>>;
	list_origin_configs: ActorMethod<[], Array<[Principal, OriginConfig]>>;
	set_controllers: ActorMethod<[SetControllersArgs], Array<[Principal, Controller]>>;
	set_origin_config: ActorMethod<[Principal, SetOriginConfig], OriginConfig>;
	set_page_view: ActorMethod<[AnalyticKey, SetPageView], Result>;
	set_page_views: ActorMethod<[Array<[AnalyticKey, SetPageView]>], Result_1>;
	version: ActorMethod<[], string>;
}
