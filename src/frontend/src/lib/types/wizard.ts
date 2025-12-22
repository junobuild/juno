import type { Principal } from '@icp-sdk/core/principal';

export type CreateWizardResult = Promise<
	| {
			success: 'ok';
			canisterId: Principal;
	  }
	| { success: 'error'; err?: unknown }
	| { success: 'warning' }
>;
