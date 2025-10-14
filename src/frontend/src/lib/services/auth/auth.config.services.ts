import type { MissionControlDid, SatelliteDid } from '$declarations';
import { getAuthConfig as getAuthConfigApi, setAuthConfig, setRule } from '$lib/api/satellites.api';
import { DEFAULT_RATE_CONFIG_TIME_PER_TOKEN_NS } from '$lib/constants/data.constants';
import { DbCollectionType } from '$lib/constants/rules.constants';
import { SATELLITE_v0_0_17 } from '$lib/constants/version.constants';
import { isSatelliteFeatureSupported } from '$lib/services/feature.services';
import { i18n } from '$lib/stores/i18n.store';
import { toasts } from '$lib/stores/toasts.store';
import type { OptionIdentity } from '$lib/types/itentity';
import type { Option } from '$lib/types/utils';
import {
	assertExternalAlternativeOrigins,
	buildDeleteAuthenticationConfig,
	buildSetAuthenticationConfig
} from '$lib/utils/auth.config.utils';
import type { Principal } from '@dfinity/principal';
import {
	fromNullable,
	fromNullishNullable,
	isNullish,
	nonNullish,
	notEmptyString,
	toNullable
} from '@dfinity/utils';
import { get } from 'svelte/store';

interface UpdateAuthConfigParams {
	satellite: MissionControlDid.Satellite;
	rule: SatelliteDid.Rule | undefined;
	config: SatelliteDid.AuthenticationConfig | undefined;
	maxTokens: number | undefined;
	externalAlternativeOrigins: string;
	allowedCallers: Principal[];
	derivationOrigin: Option<URL>;
	identity: OptionIdentity;
}

export const updateAuthConfig = async ({
	satellite,
	rule,
	config,
	maxTokens,
	derivationOrigin,
	externalAlternativeOrigins,
	allowedCallers,
	identity
}: UpdateAuthConfigParams): Promise<{ success: 'ok' | 'cancelled' | 'error'; err?: unknown }> => {
	const labels = get(i18n);

	if (isNullish(identity) || isNullish(identity?.getPrincipal())) {
		toasts.error({ text: labels.core.not_logged_in });
		return { success: 'error' };
	}

	const externalOrigins = notEmptyString(externalAlternativeOrigins)
		? externalAlternativeOrigins.split(',').map((origin) => origin.trim())
		: [];
	const { valid } = assertExternalAlternativeOrigins(externalOrigins);

	if (!valid) {
		toasts.error({ text: labels.errors.auth_external_alternative_origins });
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
		externalOrigins,
		allowedCallers,
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
	externalOrigins,
	allowedCallers,
	identity
}: Pick<UpdateAuthConfigParams, 'config' | 'derivationOrigin' | 'allowedCallers' | 'satellite'> &
	Required<Pick<UpdateAuthConfigParams, 'identity'>> & { externalOrigins: string[] }): Promise<{
	result: 'skip' | 'success' | 'error';
	err?: unknown;
}> => {
	const editConfig = nonNullish(derivationOrigin)
		? // We use the host in the backend satellite which parse the url with https to generate the /.well-known/ii-alternative-origins
			buildSetAuthenticationConfig({ config, domainName: derivationOrigin.host, externalOrigins })
		: nonNullish(config)
			? buildDeleteAuthenticationConfig(config)
			: undefined;

	const currentAllowedCallers = fromNullishNullable(config?.rules)?.allowed_callers ?? [];
	const unmodifiedRules =
		currentAllowedCallers.length === allowedCallers.length &&
		currentAllowedCallers.every(
			(caller) =>
				allowedCallers.find((allowedCaller) => allowedCaller.toText() === caller.toText()) !==
				undefined
		);

	// Do nothing if there is no current config and no derivation origin was selected and the allowed callers are untouched as well
	if (isNullish(editConfig) && unmodifiedRules) {
		return { result: 'skip' };
	}

	const editConfigRules = toNullable(
		allowedCallers.length > 0 ? { allowed_callers: allowedCallers } : undefined
	);

	try {
		await setAuthConfig({
			satelliteId,
			config: {
				internet_identity: editConfig?.internet_identity ?? config?.internet_identity ?? [],
				rules: unmodifiedRules ? (config?.rules ?? []) : editConfigRules,
				// TODO: support for Google configuration in the Console UI
				openid: [],
				version: config?.version ?? []
			},
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

	try {
		await setRule({
			rule: {
				...rule,
				rate_config: toNullable(
					nonNullish(maxTokens) && maxTokens > 0
						? {
								time_per_token_ns: DEFAULT_RATE_CONFIG_TIME_PER_TOKEN_NS,
								max_tokens: BigInt(maxTokens)
							}
						: undefined
				)
			},
			type: DbCollectionType,
			identity,
			collection: '#user',
			satelliteId
		});
	} catch (err: unknown) {
		const labels = get(i18n);

		toasts.error({
			text: labels.errors.auth_rate_config_update,
			detail: err
		});

		return { result: 'error', err };
	}

	return { result: 'success' };
};

export const getAuthConfig = async ({
	satelliteId,
	identity
}: {
	satelliteId: Principal;
	identity: OptionIdentity;
}): Promise<{
	result: 'success' | 'error' | 'skip';
	config?: SatelliteDid.AuthenticationConfig | undefined;
}> => {
	try {
		const authConfigSupported = isSatelliteFeatureSupported({
			satelliteId,
			requiredMinVersion: SATELLITE_v0_0_17
		});

		if (!authConfigSupported) {
			return { result: 'skip' };
		}

		const config = await getAuthConfigApi({
			satelliteId,
			identity
		});

		return { result: 'success', config: fromNullable(config) };
	} catch (err: unknown) {
		const labels = get(i18n);

		toasts.error({
			text: labels.errors.authentication_config_loading,
			detail: err
		});

		return { result: 'error' };
	}
};
