import type { Rule, RulesType, SetRule } from '$declarations/satellite/satellite.did';
import { setRule as setRuleApi } from '$lib/api/satellites.api';
import { DEFAULT_RATE_CONFIG_TIME_PER_TOKEN_NS } from '$lib/constants/data.constants';
import { MemoryStable, type MemoryText, type PermissionText } from '$lib/constants/rules.constants';
import type { OptionIdentity } from '$lib/types/itentity';
import { memoryFromText, permissionFromText } from '$lib/utils/rules.utils';
import { Principal } from '@dfinity/principal';
import { fromNullable, isNullish, nonNullish, toNullable } from '@dfinity/utils';

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
	type: RulesType;
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
