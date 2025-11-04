<script lang="ts">
	import { untrack } from 'svelte';
	import type { SatelliteDid, MissionControlDid } from '$declarations';
	import AuthConfigCore from '$lib/components/auth/AuthConfigCore.svelte';
	import AuthConfigII from '$lib/components/auth/AuthConfigII.svelte';
	import AuthProviders from '$lib/components/auth/AuthProviders.svelte';
	import { getAuthConfig } from '$lib/services/auth/auth.config.services';
	import { getRuleUser } from '$lib/services/collection.services';
	import { listCustomDomains } from '$lib/services/custom-domain.services';
	import { authStore } from '$lib/stores/auth.store';
	import { busy } from '$lib/stores/busy.store';
	import { versionStore } from '$lib/stores/version.store';
	import type {
		JunoModalEditAuthConfigDetail,
		JunoModalEditAuthConfigDetailCore,
		JunoModalEditAuthConfigDetailII
	} from '$lib/types/modal';
	import { emit } from '$lib/utils/events.utils';

	interface Props {
		satellite: MissionControlDid.Satellite;
	}

	let { satellite }: Props = $props();

	let satelliteId = $derived(satellite.satellite_id);

	let rule = $state<SatelliteDid.Rule | undefined>(undefined);
	let supportSettings = $state(false);

	const loadRule = async () => {
		const result = await getRuleUser({ satelliteId, identity: $authStore.identity });
		rule = result?.rule;
		supportSettings = result?.result === 'success';
	};

	let supportConfig = $state(false);
	let config = $state<SatelliteDid.AuthenticationConfig | undefined>(undefined);

	const loadConfig = async () => {
		const result = await getAuthConfig({
			satelliteId,
			identity: $authStore.identity
		});

		// eslint-disable-next-line prefer-destructuring
		config = result.config;
		supportConfig = result.result === 'success';
	};

	const load = async () => {
		await Promise.all([loadConfig(), loadRule()]);
	};

	$effect(() => {
		$versionStore;

		untrack(() => {
			load();
		});
	});

	const openModal = async (
		params: JunoModalEditAuthConfigDetailCore | JunoModalEditAuthConfigDetailII
	) => {
		busy.start();

		const { success } = await listCustomDomains({ satelliteId, reload: false });

		busy.stop();

		if (!success) {
			return;
		}

		emit({
			message: 'junoModal',
			detail: {
				type: 'edit_auth_config',
				detail: {
					config,
					satellite,
					...params
				}
			}
		});
	};
</script>

<svelte:window onjunoReloadAuthConfig={load} />

<AuthProviders />

<AuthConfigCore {config} {openModal} {rule} {supportConfig} {supportSettings} />

<AuthConfigII {config} {openModal} {supportConfig} />
