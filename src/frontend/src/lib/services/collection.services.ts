import type { CollectionType, Rule, SetRule } from '$declarations/satellite/satellite.did';
import { getRule, satelliteVersion, setRule as setRuleApi } from '$lib/api/satellites.api';
import { DEFAULT_RATE_CONFIG_TIME_PER_TOKEN_NS } from '$lib/constants/data.constants';
import { MemoryStable, type MemoryText, type PermissionText } from '$lib/constants/rules.constants';
import { SATELLITE_v0_0_21 } from '$lib/constants/version.constants';
import { i18n } from '$lib/stores/i18n.store';
import { toasts } from '$lib/stores/toasts.store';
import type { OptionIdentity } from '$lib/types/itentity';
import { memoryFromText, permissionFromText } from '$lib/utils/rules.utils';
import { Principal } from '@dfinity/principal';
import { fromNullable, isNullish, nonNullish, toNullable } from '@dfinity/utils';
import { compare } from 'semver';
import { get } from 'svelte/store';

export const setRule = async ({
	read,
	write,
	memory,
	rule,
	maxSize,
	maxCapacity,
	maxTokens,
	mutablePermissions,
	...rest
}: {
	satelliteId: Principal;
	collection: string;
	type: CollectionType;
	identity: OptionIdentity;
	read: PermissionText;
	write: PermissionText;
	memory: MemoryText;
	rule: Rule | undefined;
	maxSize: number | undefined;
	maxCapacity: number | undefined;
	maxTokens: number | undefined;
	mutablePermissions: boolean;
}) => {
	const updateRule: SetRule = {
		read: permissionFromText(read),
		write: permissionFromText(write),
		version: isNullish(rule) ? [] : rule.version,
		max_size: toNullable(nonNullish(maxSize) && maxSize > 0 ? BigInt(maxSize) : undefined),
		max_capacity: toNullable(nonNullish(maxCapacity) && maxCapacity > 0 ? maxCapacity : undefined),
		max_changes_per_user: toNullable(),
		memory: isNullish(rule)
			? [memoryFromText(memory)]
			: [fromNullable(rule.memory) ?? MemoryStable],
		mutable_permissions: toNullable(mutablePermissions),
		rate_config: toNullable(
			nonNullish(maxTokens) && maxTokens > 0
				? {
						time_per_token_ns: DEFAULT_RATE_CONFIG_TIME_PER_TOKEN_NS,
						max_tokens: BigInt(maxTokens)
					}
				: undefined
		)
	};

	await setRuleApi({
		rule: updateRule,
		...rest
	});
};

export const getRuleUser = async ({
	satelliteId,
	identity
}: {
	satelliteId: Principal;
	identity: OptionIdentity;
}): Promise<{ result: 'success' | 'error' | 'skip'; rule?: Rule | undefined }> => {
	// TODO: load versions globally and use store value instead of fetching version again
	const version = await satelliteVersion({ satelliteId, identity });

	// TODO: keep a list of those version checks and remove them incrementally
	// Also would be cleaner than to have 0.0.17 hardcoded there and there...
	const rateConfigSupported = compare(version, SATELLITE_v0_0_21) >= 0;

	if (!rateConfigSupported) {
		return { result: 'skip' };
	}

	try {
		const result = await getRule({
			satelliteId,
			collection: '#user',
			identity,
			type: { Db: null }
		});

		return { result: 'success', rule: fromNullable(result) };
	} catch (err: unknown) {
		const labels = get(i18n);

		toasts.error({
			text: labels.errors.load_settings,
			detail: err
		});

		return { result: 'error' };
	}
};
