import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';
import type { Principal } from '@dfinity/principal';

export interface Controller {
	updated_at: bigint;
	metadata: Array<[string, string]>;
	created_at: bigint;
	scope: ControllerScope;
	expires_at: [] | [bigint];
}
export type ControllerScope = { Write: null } | { Admin: null } | { Submit: null };
export interface CyclesBalance {
	timestamp: bigint;
	amount: bigint;
}
export interface DeleteControllersArgs {
	controllers: Array<Principal>;
}
export interface DepositedCyclesEmailNotification {
	to: string;
	deposited_cycles: CyclesBalance;
}
export interface Env {
	email_api_key: [] | [string];
}
export interface FailedCyclesDepositEmailNotification {
	to: string;
	funding_failure: FundingFailure;
}
export type FundingErrorCode =
	| { BalanceCheckFailed: null }
	| { ObtainCyclesFailed: null }
	| { DepositFailed: null }
	| { InsufficientCycles: null }
	| { Other: string };
export interface FundingFailure {
	timestamp: bigint;
	error_code: FundingErrorCode;
}
export interface GetNotifications {
	to: [] | [bigint];
	from: [] | [bigint];
	segment_id: [] | [Principal];
}
export interface GetOpenIdCertificateArgs {
	provider: OpenIdProvider;
}
export interface Jwk {
	alg: [] | [string];
	kid: [] | [string];
	kty: JwkType;
	params: JwkParams;
}
export type JwkParams =
	| { Ec: JwkParamsEc }
	| { Oct: JwkParamsOct }
	| { Okp: JwkParamsOkp }
	| { Rsa: JwkParamsRsa };
export interface JwkParamsEc {
	x: string;
	y: string;
	crv: string;
}
export interface JwkParamsOct {
	k: string;
}
export interface JwkParamsOkp {
	x: string;
	crv: string;
}
export interface JwkParamsRsa {
	e: string;
	n: string;
}
export type JwkType = { EC: null } | { OKP: null } | { RSA: null } | { oct: null };
export interface Jwks {
	keys: Array<Jwk>;
}
export type NotificationKind =
	| {
			DepositedCyclesEmail: DepositedCyclesEmailNotification;
	  }
	| { FailedCyclesDepositEmail: FailedCyclesDepositEmailNotification };
export interface NotifyArgs {
	kind: NotificationKind;
	user: Principal;
	segment: Segment;
}
export interface NotifyStatus {
	pending: bigint;
	sent: bigint;
	failed: bigint;
}
export interface OpenIdCertificate {
	updated_at: bigint;
	jwks: Jwks;
	created_at: bigint;
	version: [] | [bigint];
	expires_at: [] | [bigint];
}
export type OpenIdProvider = { Google: null };
export interface Segment {
	id: Principal;
	metadata: [] | [Array<[string, string]>];
	kind: SegmentKind;
}
export type SegmentKind = { Orbiter: null } | { MissionControl: null } | { Satellite: null };
export interface SetController {
	metadata: Array<[string, string]>;
	scope: ControllerScope;
	expires_at: [] | [bigint];
}
export interface SetControllersArgs {
	controller: SetController;
	controllers: Array<Principal>;
}
export interface _SERVICE {
	del_controllers: ActorMethod<[DeleteControllersArgs], undefined>;
	get_notify_status: ActorMethod<[GetNotifications], NotifyStatus>;
	get_openid_certificate: ActorMethod<[GetOpenIdCertificateArgs], [] | [OpenIdCertificate]>;
	list_controllers: ActorMethod<[], Array<[Principal, Controller]>>;
	notify: ActorMethod<[NotifyArgs], undefined>;
	ping: ActorMethod<[NotifyArgs], undefined>;
	set_controllers: ActorMethod<[SetControllersArgs], undefined>;
	set_env: ActorMethod<[Env], undefined>;
	start_openid_monitoring: ActorMethod<[], undefined>;
	stop_openid_monitoring: ActorMethod<[], undefined>;
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
