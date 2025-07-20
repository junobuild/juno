import type { canister_settings } from '$declarations/ic/ic.did';
import { canisterUpdateSettings } from '$lib/api/ic.api';
import { i18n } from '$lib/stores/i18n.store';
import { toasts } from '$lib/stores/toasts.store';
import type { CanisterInfo, CanisterSettings } from '$lib/types/canister';
import type { OptionIdentity } from '$lib/types/itentity';
import { lacksCyclesForFreezingThreshold } from '$lib/utils/canister.utils';
import type { Principal } from '@dfinity/principal';
import { isNullish, toNullable } from '@dfinity/utils';
import { get } from 'svelte/store';

export const updateSettings = async ({
	canisterId,
	identity,
	currentSettings,
	newSettings,
	canisterInfo
}: {
	canisterId: Principal;
	identity: OptionIdentity;
	currentSettings: CanisterSettings;
	canisterInfo: CanisterInfo;
	newSettings: Omit<CanisterSettings, 'controllers'>;
}): Promise<{ success: 'ok' | 'cancelled' | 'error'; err?: unknown }> => {
	const labels = get(i18n);

	if (isNullish(identity) || isNullish(identity?.getPrincipal())) {
		toasts.error({ text: labels.core.not_logged_in });
		return { success: 'error' };
	}

	const {
		freezingThreshold,
		reservedCyclesLimit,
		logVisibility,
		wasmMemoryLimit,
		memoryAllocation,
		computeAllocation
	} = newSettings;

	const keepCurrentFreezingThreshold = freezingThreshold === currentSettings.freezingThreshold;
	const updateFreezingThreshold = !keepCurrentFreezingThreshold;

	const updateSettings: canister_settings = {
		freezing_threshold: toNullable(keepCurrentFreezingThreshold ? undefined : freezingThreshold),
		controllers: toNullable(),
		log_visibility: toNullable(
			logVisibility === currentSettings.logVisibility
				? undefined
				: logVisibility === 'public'
					? { public: null }
					: { controllers: null }
		),
		compute_allocation: toNullable(
			computeAllocation === currentSettings.computeAllocation ? undefined : computeAllocation
		),
		memory_allocation: toNullable(
			memoryAllocation === currentSettings.memoryAllocation ? undefined : memoryAllocation
		),
		reserved_cycles_limit: toNullable(
			reservedCyclesLimit === currentSettings.reservedCyclesLimit ? undefined : reservedCyclesLimit
		),
		wasm_memory_limit: toNullable(
			wasmMemoryLimit === currentSettings.wasmMemoryLimit ? undefined : wasmMemoryLimit
		),
		// Function on_low_wasm_memory is not implemented (currently) in any Juno modules. That is why the settings is also unused.
		wasm_memory_threshold: toNullable()
	};

	if (
		updateSettings.freezing_threshold.length === 0 &&
		updateSettings.log_visibility.length === 0 &&
		updateSettings.log_visibility.length === 0 &&
		updateSettings.compute_allocation.length === 0 &&
		updateSettings.memory_allocation.length === 0 &&
		updateSettings.reserved_cycles_limit.length === 0 &&
		updateSettings.wasm_memory_limit.length === 0
	) {
		toasts.show({ text: labels.canisters.no_update_required, level: 'info' });
		return { success: 'cancelled' };
	}

	if (
		updateFreezingThreshold &&
		lacksCyclesForFreezingThreshold({
			canisterInfo,
			freezingThreshold
		})
	) {
		// We do not want to auto-hide the toast in this particular case
		toasts.show({
			text: labels.canisters.not_enough_cycles_to_update_freezing_threshold,
			level: 'warn'
		});
		return { success: 'cancelled' };
	}

	try {
		await canisterUpdateSettings({
			canisterId,
			identity,
			settings: updateSettings
		});
	} catch (err: unknown) {
		toasts.error({
			text: labels.errors.canister_update_error,
			detail: err
		});

		return { success: 'error', err };
	}

	return { success: 'ok' };
};
