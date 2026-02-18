<script lang="ts">
	import { getContext, type Snippet, untrack } from 'svelte';
	import { fade } from 'svelte/transition';
	import SpinnerParagraph from '$lib/components/ui/SpinnerParagraph.svelte';
	import Warning from '$lib/components/ui/Warning.svelte';
	import { authIdentity } from '$lib/derived/auth.derived';
	import { satelliteAuthConfig } from '$lib/derived/satellite/satellite-configs.derived';
	import { getRuleUser } from '$lib/services/satellite/collection/collection.services';
	import { loadSatelliteConfig } from '$lib/services/satellite/satellite-config.services';
	import { i18n } from '$lib/stores/app/i18n.store';
	import { versionStore } from '$lib/stores/version.store';
	import { AUTH_CONFIG_CONTEXT_KEY, type AuthConfigContext } from '$lib/types/auth.context';
	import type { Satellite } from '$lib/types/satellite';

	interface Props {
		satellite: Satellite;
		children: Snippet;
	}

	let { satellite, children }: Props = $props();

	let satelliteId = $derived(satellite.satellite_id);

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const { setRule, state } = getContext<AuthConfigContext>(AUTH_CONFIG_CONTEXT_KEY);

	const loadRule = async () => {
		const result = await getRuleUser({ satelliteId, identity: $authIdentity });
		setRule(result);
	};

	const loadConfig = async ({ reload }: { reload: boolean } = { reload: false }) => {
		await loadSatelliteConfig({
			satelliteId,
			identity: $authIdentity,
			reload
		});
	};

	const load = async () => {
		await Promise.all([loadConfig(), loadRule()]);
	};

	const reload = async () => {
		await Promise.all([loadConfig({ reload: true }), loadRule()]);
	};

	$effect(() => {
		$versionStore;

		if (Object.keys($versionStore.satellites).length === 0) {
			return;
		}

		untrack(() => {
			load();
		});
	});
</script>

<svelte:window onjunoReloadAuthConfig={reload} />

{#if $state === 'initialized'}
	<div in:fade>
		{@render children()}
	</div>
{:else if $state === 'error'}
	<Warning>{$i18n.errors.load_auth_config_error}</Warning>
{:else}
	<SpinnerParagraph>{$i18n.core.loading_config}</SpinnerParagraph>
{/if}
