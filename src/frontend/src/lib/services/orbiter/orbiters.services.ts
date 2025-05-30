import type { Orbiter } from '$declarations/mission_control/mission_control.did';
import type {
	OrbiterSatelliteConfig,
	OrbiterSatelliteFeatures,
	OrbiterSatelliteConfig as SatelliteConfig
} from '$declarations/orbiter/orbiter.did';
import { getMissionControlActor } from '$lib/api/actors/actor.juno.api';
import {
	listOrbiterSatelliteConfigs as listOrbiterSatelliteConfigsApi,
	setOrbiterSatelliteConfigs as setOrbiterSatelliteConfigsApi
} from '$lib/api/orbiter.api';
import {
	listOrbiterSatelliteConfigs007,
	setOrbiterSatelliteConfigs007 as setOrbiterSatelliteConfigsDeprecatedApi
} from '$lib/api/orbiter.deprecated.api';
import { DEFAULT_FEATURES } from '$lib/constants/analytics.constants';
import { ORBITER_v0_0_8 } from '$lib/constants/version.constants';
import { orbiterConfigs } from '$lib/derived/orbiter.derived';
import { loadDataStore } from '$lib/services/loader.services';
import { authStore } from '$lib/stores/auth.store';
import { i18n } from '$lib/stores/i18n.store';
import { orbitersConfigsStore } from '$lib/stores/orbiter-configs.store';
import { orbitersUncertifiedStore } from '$lib/stores/orbiter.store';
import { toasts } from '$lib/stores/toasts.store';
import type { OptionIdentity } from '$lib/types/itentity';
import type { OrbiterSatelliteConfigEntry } from '$lib/types/orbiter';
import type { SatelliteIdText } from '$lib/types/satellite';
import type { Option } from '$lib/types/utils';
import type { Identity } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { assertNonNullish, isNullish, nonNullish, toNullable } from '@dfinity/utils';
import { compare } from 'semver';
import { get } from 'svelte/store';

interface CreateOrbiterConfig {
	name?: string;
	subnetId?: Principal;
}

export const createOrbiter = async ({
	identity,
	missionControlId,
	config: { name }
}: {
	identity: Option<Identity>;
	missionControlId: Option<Principal>;
	config: CreateOrbiterConfig;
}): Promise<Orbiter> => {
	assertNonNullish(missionControlId);

	const { create_orbiter } = await getMissionControlActor({
		missionControlId,
		identity
	});

	return create_orbiter(toNullable(name));
};

export const createOrbiterWithConfig = async ({
	identity,
	missionControlId,
	config: { name, subnetId }
}: {
	identity: Option<Identity>;
	missionControlId: Option<Principal>;
	config: CreateOrbiterConfig;
}): Promise<Orbiter> => {
	assertNonNullish(missionControlId);

	const { create_orbiter_with_config } = await getMissionControlActor({
		missionControlId,
		identity
	});

	return create_orbiter_with_config({
		name: toNullable(name),
		subnet_id: toNullable(subnetId)
	});
};

export const loadOrbiters = async ({
	missionControlId,
	reload = false
}: {
	missionControlId: Option<Principal>;
	reload?: boolean;
}): Promise<{ result: 'skip' | 'success' | 'error' }> => {
	if (isNullish(missionControlId)) {
		return { result: 'skip' };
	}

	const load = async (identity: Identity): Promise<Orbiter[]> => {
		const { list_orbiters } = await getMissionControlActor({
			missionControlId,
			identity
		});

		const orbiters = await list_orbiters();

		return orbiters.map(([_, orbiter]) => orbiter);
	};

	const { identity } = get(authStore);

	return await loadDataStore<Orbiter[]>({
		identity,
		store: orbitersUncertifiedStore,
		errorLabel: 'orbiters_loading',
		load,
		reload
	});
};

export const loadOrbiterConfigs = async ({
	orbiterId,
	orbiterVersion,
	reload = false
}: {
	orbiterId: Principal;
	orbiterVersion: string;
	reload?: boolean;
}): Promise<{ result: 'skip' | 'success' | 'error' }> => {
	// We load only once
	const existingConfigs = get(orbiterConfigs);
	if (nonNullish(existingConfigs) && !reload) {
		return { result: 'skip' };
	}

	try {
		const { identity } = get(authStore);

		const configs = await listOrbiterSatelliteConfigs({
			identity,
			orbiterVersion,
			orbiterId
		});

		orbitersConfigsStore.setConfigs({
			configs,
			orbiterId: orbiterId.toText()
		});

		return { result: 'success' };
	} catch (err: unknown) {
		const labels = get(i18n);

		toasts.error({
			text: labels.errors.orbiter_configuration_listing,
			detail: err
		});

		return { result: 'error' };
	}
};

// We originally migrated the features to be all enabled but, in v0.2.0 decided to make the performance metrics disabled by default.
const deprecatedEnabledFeatures = {
	performance_metrics: true,
	track_events: true,
	page_views: true
};

const listOrbiterSatelliteConfigs = async ({
	orbiterVersion,
	...rest
}: {
	orbiterId: Principal;
	identity: OptionIdentity;
	orbiterVersion: string;
}): Promise<[Principal, SatelliteConfig][]> => {
	if (compare(orbiterVersion, ORBITER_v0_0_8) >= 0) {
		return await listOrbiterSatelliteConfigsApi(rest);
	}

	// Backwards compatibility
	const results = await listOrbiterSatelliteConfigs007(rest);

	return results.map(([satelliteId, { enabled, ...rest }]) => [
		satelliteId,
		{
			...rest,
			restricted_origin: toNullable(),
			features: enabled ? [deprecatedEnabledFeatures] : []
		}
	]);
};

export const setOrbiterSatelliteConfigs = async ({
	orbiterId,
	config,
	identity,
	orbiterVersion,
	features
}: {
	orbiterId: Principal;
	config: Record<SatelliteIdText, OrbiterSatelliteConfigEntry>;
	identity: OptionIdentity;
	orbiterVersion: string;
	features: OrbiterSatelliteFeatures | undefined;
}): Promise<[Principal, OrbiterSatelliteConfig][]> => {
	if (compare(orbiterVersion, ORBITER_v0_0_8) >= 0) {
		return await setOrbiterSatelliteConfigsApi({
			orbiterId,
			config: Object.entries(config).map(([satelliteId, value]) => [
				Principal.fromText(satelliteId),
				{
					features: value.enabled ? [features ?? DEFAULT_FEATURES] : [],
					restricted_origin: toNullable(),
					version: nonNullish(value.config) ? value.config.version : []
				}
			]),
			identity
		});
	}

	// Backwards compatibility
	const results = await setOrbiterSatelliteConfigsDeprecatedApi({
		orbiterId,
		config: Object.entries(config).map(([satelliteId, value]) => [
			Principal.fromText(satelliteId),
			{
				enabled: value.enabled,
				version: nonNullish(value.config) ? value.config.version : []
			}
		]),
		identity
	});

	return results.map(([satelliteId, { enabled, ...rest }]) => [
		satelliteId,
		{
			...rest,
			restricted_origin: toNullable(),
			features: enabled ? [deprecatedEnabledFeatures] : []
		}
	]);
};
