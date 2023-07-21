import type { ActorMethod } from '@dfinity/agent';
import type { Principal } from '@dfinity/principal';

export interface AnalyticKey {
	key: string;
	session_id: string;
	satellite_id: Principal;
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
	set_page_view: ActorMethod<[AnalyticKey, SetPageView], PageView>;
	set_page_views: ActorMethod<[Array<[AnalyticKey, SetPageView]>], undefined>;
}
