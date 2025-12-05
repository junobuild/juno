import { i18n } from '$lib/stores/app/i18n.store';
import { assertNonNullish, isNullish } from '@dfinity/utils';
import { type PrincipalText, PrincipalTextSchema } from '@dfinity/zod-schemas';
import type { Principal } from '@icp-sdk/core/principal';
import { get } from 'svelte/store';

export const getEmulatorMainIdentity = async (): Promise<PrincipalText> => {
	const { VITE_EMULATOR_ADMIN_URL } = import.meta.env;

	assertNonNullish(VITE_EMULATOR_ADMIN_URL);

	const response = await fetch(`${VITE_EMULATOR_ADMIN_URL}/admin/identities`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json'
		}
	});

	if (!response.ok) {
		throw new Error(get(i18n).emulator.error_fetching_emulator, { cause: response });
	}

	const result: Record<string, string> = await response.json();

	const identity = result?.main;

	if (isNullish(identity)) {
		throw new Error(get(i18n).emulator.error_no_main_identity);
	}

	return PrincipalTextSchema.parse(identity);
};

export const emulatorLedgerTransfer = async ({
	missionControlId
}: {
	missionControlId: Principal;
}) => {
	const { VITE_EMULATOR_ADMIN_URL } = import.meta.env;

	assertNonNullish(VITE_EMULATOR_ADMIN_URL);

	const response = await fetch(
		`${VITE_EMULATOR_ADMIN_URL}/ledger/transfer/?to=${missionControlId.toText()}`
	);

	if (!response.ok) {
		throw new Error(get(i18n).emulator.error_fetching_emulator, { cause: response });
	}
};

export const emulatorObservatoryMonitoringOpenId = async ({
	action
}: {
	action: 'start' | 'stop';
}) => {
	const { VITE_EMULATOR_ADMIN_URL } = import.meta.env;

	assertNonNullish(VITE_EMULATOR_ADMIN_URL);

	const response = await fetch(
		`${VITE_EMULATOR_ADMIN_URL}/observatory/monitoring/openid/?action=${action}`
	);

	if (!response.ok) {
		throw new Error(get(i18n).emulator.error_fetching_emulator, { cause: response });
	}
};
