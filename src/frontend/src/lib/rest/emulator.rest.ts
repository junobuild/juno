import { i18n } from '$lib/stores/i18n.store';
import type { Principal } from '@dfinity/principal';
import { assertNonNullish, isNullish } from '@dfinity/utils';
import { type PrincipalText, PrincipalTextSchema } from '@dfinity/zod-schemas';
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
		throw new Error(get(i18n).emulator.error_get_identities);
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

	await fetch(`${VITE_EMULATOR_ADMIN_URL}/ledger/transfer/?to=${missionControlId.toText()}`);
};
