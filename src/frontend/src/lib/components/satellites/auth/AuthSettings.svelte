<script lang="ts">
	import { setContext } from 'svelte';
	import AuthConfigCore from '$lib/components/satellites/auth/AuthConfigCore.svelte';
	import AuthConfigOpenId from '$lib/components/satellites/auth/AuthConfigOpenId.svelte';
	import AuthConfigII from '$lib/components/satellites/auth/AuthConfigII.svelte';
	import AuthProviders from '$lib/components/satellites/auth/AuthProviders.svelte';
	import AuthSettingsLoader from '$lib/components/satellites/auth/AuthSettingsLoader.svelte';
	import { listCustomDomains } from '$lib/services/satellite/hosting/custom-domain.services';
	import { busy } from '$lib/stores/app/busy.store';
	import { initAuthConfigContext } from '$lib/stores/satellite/auth.context.store';
	import { AUTH_CONFIG_CONTEXT_KEY, type AuthConfigContext } from '$lib/types/auth.context';
	import type { JunoModalEditAuthConfigDetailType } from '$lib/types/modal';
	import type { Satellite } from '$lib/types/satellite';
	import { emit } from '$lib/utils/events.utils';

	interface Props {
		satellite: Satellite;
	}

	let { satellite }: Props = $props();

	let satelliteId = $derived(satellite.satellite_id);

	const { config, ...contextRest } = initAuthConfigContext();

	setContext<AuthConfigContext>(AUTH_CONFIG_CONTEXT_KEY, { config, ...contextRest });

	const openModal = async (params: JunoModalEditAuthConfigDetailType) => {
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
					config: $config,
					satellite,
					...params
				}
			}
		});
	};
</script>

<AuthSettingsLoader {satellite}>
	<AuthProviders />

	<AuthConfigOpenId {openModal} {satellite} provider="google" />

	<AuthConfigOpenId {openModal} {satellite} provider="github" />

	<AuthConfigII {openModal} />

	<AuthConfigCore {openModal} />
</AuthSettingsLoader>
