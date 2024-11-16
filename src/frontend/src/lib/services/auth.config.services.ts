import type { Satellite } from '$declarations/mission_control/mission_control.did';
import type { AuthenticationConfig, Rule } from '$declarations/satellite/satellite.did';
import { setAuthConfig, setRule } from '$lib/api/satellites.api';
import { DEFAULT_RATE_CONFIG_TIME_PER_TOKEN_NS } from '$lib/constants/data.constants';
import { i18n } from '$lib/stores/i18n.store';
import { toasts } from '$lib/stores/toasts.store';
import type { OptionIdentity } from '$lib/types/itentity';
import {
	buildDeleteAuthenticationConfig,
	buildSetAuthenticationConfig
} from '$lib/utils/auth.config.utils';
import { isNullish, nonNullish } from '@dfinity/utils';
import { get } from 'svelte/store';

interface UpdateAuthConfigParams {
	satellite: Satellite;
	rule: Rule | undefined;
	config: AuthenticationConfig | undefined;
	maxTokens: number | undefined;
	derivationOrigin: Option<URL>;
	identity: OptionIdentity;
}

export const updateAuthConfig = async ({
	satellite,
	rule,
	config,
	maxTokens,
	derivationOrigin,
	identity
}: UpdateAuthConfigParams): Promise<{ success: 'ok' | 'cancelled' | 'error'; err?: unknown }> => {
	const labels = get(i18n);

	if (isNullish(identity) || isNullish(identity?.getPrincipal())) {
		toasts.error({ text: labels.core.not_logged_in });
		return { success: 'error' };
	}

	const { result: resultRule } = await updateRule({
		satellite,
		maxTokens,
		rule,
		identity
	});

	if (resultRule === 'error') {
		return { success: 'error' };
	}

	const { result: resultConfig } = await updateConfig({
		satellite,
		derivationOrigin,
		config,
		identity
	});

	if (resultConfig === 'error') {
		return { success: 'error' };
	}

	return { success: 'ok' };
};

const updateConfig = async ({
	satellite: { satellite_id: satelliteId },
	config,
	derivationOrigin,
	identity
}: Pick<UpdateAuthConfigParams, 'config' | 'derivationOrigin' | 'satellite'> &
	Required<Pick<UpdateAuthConfigParams, 'identity'>>): Promise<{
	result: 'skip' | 'success' | 'error';
	err?: unknown;
}> => {
	const editConfig = nonNullish(derivationOrigin)
		? buildSetAuthenticationConfig({ config, domainName: derivationOrigin.origin })
		: nonNullish(config)
			? buildDeleteAuthenticationConfig(config)
			: undefined;

	// Do nothing if there is no current config and no derivation origin was selected
	if (isNullish(editConfig)) {
		return { result: 'skip' };
	}

	try {
		await setAuthConfig({
			satelliteId,
			config: editConfig,
			identity
		});
	} catch (err: unknown) {
		const labels = get(i18n);

		toasts.error({
			text: labels.errors.auth_domain_config,
			detail: err
		});

		return { result: 'error', err };
	}

	return { result: 'success' };
};

const updateRule = async ({
	satellite: { satellite_id: satelliteId },
	rule,
	maxTokens,
	identity
}: Pick<UpdateAuthConfigParams, 'rule' | 'maxTokens' | 'satellite'> &
	Required<Pick<UpdateAuthConfigParams, 'identity'>>): Promise<{
	result: 'skip' | 'success' | 'error';
	err?: unknown;
}> => {
	// We do nothing if no rule is provided
	if (isNullish(rule)) {
		return { result: 'skip' };
	}

	const labels = get(i18n);

	if (isNullish(maxTokens)) {
		toasts.error({ text: labels.errors.auth_rate_config_max_tokens });
		return { result: 'error' };
	}

	try {
		await setRule({
			rule: {
				...rule,
				rate_config: [
					{
						time_per_token_ns: DEFAULT_RATE_CONFIG_TIME_PER_TOKEN_NS,
						max_tokens: BigInt(maxTokens)
					}
				]
			},
			type: { Db: null },
			identity,
			collection: '#user',
			satelliteId
		});
	} catch (err: unknown) {
		toasts.error({
			text: labels.errors.auth_rate_config_update,
			detail: err
		});

		return { result: 'error', err };
	}

	return { result: 'success' };
};
