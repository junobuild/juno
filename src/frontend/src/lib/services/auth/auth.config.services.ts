import type { MissionControlDid, SatelliteDid } from '$declarations';
import type { OpenIdProviderDelegationConfig } from '$declarations/satellite/satellite.did';
import { getAuthConfig as getAuthConfigApi, setAuthConfig, setRule } from '$lib/api/satellites.api';
import {
	AUTH_DEFAULT_MAX_SESSION_TIME_TO_LIVE,
	GOOGLE_CLIENT_ID_REGEX
} from '$lib/constants/auth.constants';
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
import {
	fromNullable,
	fromNullishNullable,
	isNullish,
	nonNullish,
	notEmptyString,
	toNullable
} from '@dfinity/utils';
import type { PrincipalText } from '@dfinity/zod-schemas';
import { Principal } from '@icp-sdk/core/principal';
import { get } from 'svelte/store';

interface UpdateAuthConfigParams {
	satellite: MissionControlDid.Satellite;
	config: SatelliteDid.AuthenticationConfig | undefined;
	identity: OptionIdentity;
}

export interface UpdateAuthConfigResult {
	success: 'ok' | 'cancelled' | 'error';
	err?: unknown;
}

interface UpdateResult {
	result: 'skip' | 'success' | 'error';
	err?: unknown;
}

interface UpdateAuthConfigRulesParams extends UpdateAuthConfigParams {
	rule: SatelliteDid.Rule | undefined;
	maxTokens: number | undefined;
	allowedCallers: Principal[];
}

interface UpdateAuthConfigIIParams extends UpdateAuthConfigParams {
	externalAlternativeOrigins: string;
	derivationOrigin: Option<URL>;
}

interface UpdateAuthConfigGoogleParams extends UpdateAuthConfigParams {
	clientId: string | undefined;
	maxTimeToLive: bigint | undefined;
	allowedTargets: PrincipalText[] | null | undefined;
}

export const updateAuthConfigRules = async ({
	satellite,
	rule,
	config,
	maxTokens,
	allowedCallers,
	identity
}: UpdateAuthConfigRulesParams): Promise<UpdateAuthConfigResult> => {
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

	const { result: resultConfig } = await updateConfigRules({
		satellite,
		allowedCallers,
		config,
		identity
	});

	if (resultConfig === 'error') {
		return { success: 'error' };
	}

	return { success: 'ok' };
};

export const updateAuthConfigInternetIdentity = async ({
	satellite,
	config,
	derivationOrigin,
	externalAlternativeOrigins,
	identity
}: UpdateAuthConfigIIParams): Promise<UpdateAuthConfigResult> => {
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

	const { result: resultConfig } = await updateConfigInternetIdentity({
		satellite,
		derivationOrigin,
		externalOrigins,
		config,
		identity
	});

	if (resultConfig === 'error') {
		return { success: 'error' };
	}

	return { success: 'ok' };
};

export const updateAuthConfigGoogle = async ({
	satellite,
	config,
	clientId,
	maxTimeToLive,
	allowedTargets,
	identity
}: UpdateAuthConfigGoogleParams): Promise<UpdateAuthConfigResult> => {
	const labels = get(i18n);

	if (isNullish(identity) || isNullish(identity?.getPrincipal())) {
		toasts.error({ text: labels.core.not_logged_in });
		return { success: 'error' };
	}

	if (isNullish(clientId)) {
		const { result: resultConfig } = await disableConfigGoogle({
			satellite,
			config,
			identity
		});

		return { success: resultConfig === 'error' ? 'error' : 'ok' };
	}

	if (!GOOGLE_CLIENT_ID_REGEX.test(clientId)) {
		toasts.error({ text: labels.errors.auth_invalid_google_client_id });
		return { success: 'error' };
	}

	const { result: resultConfig } = await updateConfigGoogle({
		satellite,
		clientId,
		maxTimeToLive,
		allowedTargets,
		config,
		identity
	});

	return { success: resultConfig === 'error' ? 'error' : 'ok' };
};

const updateConfigRules = async ({
	satellite,
	config,
	allowedCallers,
	identity
}: Pick<UpdateAuthConfigRulesParams, 'config' | 'allowedCallers' | 'satellite'> &
	Required<Pick<UpdateAuthConfigParams, 'identity'>>): Promise<UpdateResult> => {
	const currentAllowedCallers = fromNullishNullable(config?.rules)?.allowed_callers ?? [];
	const unmodifiedRules =
		currentAllowedCallers.length === allowedCallers.length &&
		currentAllowedCallers.every(
			(caller) =>
				allowedCallers.find((allowedCaller) => allowedCaller.toText() === caller.toText()) !==
				undefined
		);

	// Do nothing if the allowed callers are untouched
	if (unmodifiedRules) {
		return { result: 'skip' };
	}

	const editConfigRules = toNullable(
		allowedCallers.length > 0 ? { allowed_callers: allowedCallers } : undefined
	);

	return await updateConfig({
		config: {
			internet_identity: config?.internet_identity ?? [],
			rules: unmodifiedRules ? (config?.rules ?? []) : editConfigRules,
			openid: config?.openid ?? [],
			version: config?.version ?? []
		},
		satellite,
		identity
	});
};

const updateConfigInternetIdentity = async ({
	satellite,
	config,
	derivationOrigin,
	externalOrigins,
	identity
}: Pick<UpdateAuthConfigIIParams, 'config' | 'derivationOrigin' | 'satellite'> &
	Required<Pick<UpdateAuthConfigParams, 'identity'>> & {
		externalOrigins: string[];
	}): Promise<UpdateResult> => {
	const editConfig = nonNullish(derivationOrigin)
		? // We use the host in the backend satellite which parse the url with https to generate the /.well-known/ii-alternative-origins
			buildSetAuthenticationConfig({ config, domainName: derivationOrigin.host, externalOrigins })
		: nonNullish(config)
			? buildDeleteAuthenticationConfig(config)
			: undefined;

	// Do nothing if there is no current config and no derivation origin was selected
	if (isNullish(editConfig)) {
		return { result: 'skip' };
	}

	return await updateConfig({
		config: {
			internet_identity: editConfig?.internet_identity ?? config?.internet_identity ?? [],
			rules: config?.rules ?? [],
			openid: config?.openid ?? [],
			version: config?.version ?? []
		},
		satellite,
		identity
	});
};

const disableConfigGoogle = async ({
	satellite,
	config,
	identity
}: Pick<UpdateAuthConfigGoogleParams, 'config' | 'satellite'> &
	Required<Pick<UpdateAuthConfigParams, 'identity'>>): Promise<UpdateResult> => {
	const openid = fromNullable(config?.openid ?? []);
	const google = openid?.providers.find(([key]) => 'Google' in key);

	if (isNullish(google)) {
		return { result: 'skip' };
	}

	// TODO: we set the all OpenID to None for simplicity reason as we do not support currently any other provider than Google
	return await updateConfig({
		config: {
			internet_identity: config?.internet_identity ?? [],
			rules: config?.rules ?? [],
			openid: [],
			version: config?.version ?? []
		},
		satellite,
		identity
	});
};

const updateConfigGoogle = async ({
	satellite,
	config,
	clientId,
	maxTimeToLive,
	allowedTargets,
	identity
}: Pick<UpdateAuthConfigGoogleParams, 'config' | 'maxTimeToLive' | 'allowedTargets' | 'satellite'> &
	Required<Pick<UpdateAuthConfigParams, 'identity'>> & {
		clientId: string;
	}): Promise<UpdateResult> => {
	const openid = fromNullable(config?.openid ?? []);
	const google = openid?.providers.find(([key]) => 'Google' in key);
	const providerData = google?.[1];
	const delegation = fromNullable(providerData?.delegation ?? []);

	const sameClientId = providerData?.client_id === clientId;

	const updateMaxTimeToLive =
		maxTimeToLive === AUTH_DEFAULT_MAX_SESSION_TIME_TO_LIVE ? undefined : maxTimeToLive;

	const sameMaxTimeToLive =
		fromNullable(delegation?.max_time_to_live ?? []) === updateMaxTimeToLive;

	const targets =
		// delegation.targets===[] (exactly equals because delegation is undefined by default)
		nonNullish(delegation) && nonNullish(delegation.targets) && delegation.targets.length === 0
			? null
			: // delegation.targets===[[]]
				(fromNullable(delegation?.targets ?? []) ?? []).length === 0
				? undefined
				: (fromNullable(delegation?.targets ?? []) ?? []).map((p) => p.toText());

	const sameTargets =
		(isNullish(allowedTargets) && allowedTargets === targets) ||
		(nonNullish(allowedTargets) &&
			allowedTargets?.length === targets?.length &&
			(allowedTargets ?? []).find((allowedTarget) => !(targets ?? []).includes(allowedTarget)) ===
				undefined);

	if (sameClientId && sameMaxTimeToLive && sameTargets) {
		return { result: 'skip' };
	}

	const updateDelegation: OpenIdProviderDelegationConfig | undefined = nonNullish(
		updateMaxTimeToLive
	)
		? {
				max_time_to_live: toNullable(updateMaxTimeToLive),
				targets:
					allowedTargets === null ? [] : [(allowedTargets ?? []).map((p) => Principal.fromText(p))]
			}
		: allowedTargets === null
			? {
					max_time_to_live: toNullable(),
					targets: []
				}
			: (allowedTargets ?? []).length > 0
				? {
						max_time_to_live: toNullable(),
						targets: [(allowedTargets ?? []).map((p) => Principal.fromText(p))]
					}
				: undefined;

	return await updateConfig({
		config: {
			internet_identity: config?.internet_identity ?? [],
			rules: config?.rules ?? [],
			openid: [
				{
					providers: [
						[
							{ Google: null },
							{
								client_id: clientId,
								delegation: toNullable(updateDelegation)
							}
						]
					],
					observatory_id: toNullable()
				}
			],
			version: config?.version ?? []
		},
		satellite,
		identity
	});
};

const updateConfig = async ({
	satellite: { satellite_id: satelliteId },
	config,
	identity
}: Pick<UpdateAuthConfigParams, 'satellite'> &
	Required<Pick<UpdateAuthConfigParams, 'identity'>> & {
		config: SatelliteDid.SetAuthenticationConfig;
	}): Promise<UpdateResult> => {
	try {
		await setAuthConfig({
			satelliteId,
			config,
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
}: Pick<UpdateAuthConfigRulesParams, 'rule' | 'maxTokens' | 'satellite'> &
	Required<Pick<UpdateAuthConfigParams, 'identity'>>): Promise<UpdateResult> => {
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
