import type { OptionIdentity } from '$lib/types/itentity';

export interface LoadVersionBaseParams {
	skipReload: boolean;
	identity: OptionIdentity;
	toastError?: boolean;
}

export type LoadVersionResult = { result: 'loaded' } | {result: "skipped"} | { result: 'error'; err: unknown };
