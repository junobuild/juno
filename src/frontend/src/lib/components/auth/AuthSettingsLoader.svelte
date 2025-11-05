<script lang="ts">
	import { getContext, type Snippet, untrack } from 'svelte';
	import { fade } from 'svelte/transition';
	import type { MissionControlDid } from '$declarations';
	import SpinnerParagraph from '$lib/components/ui/SpinnerParagraph.svelte';
	import Warning from '$lib/components/ui/Warning.svelte';
	import { getAuthConfig } from '$lib/services/auth/auth.config.services';
	import { getRuleUser } from '$lib/services/collection.services';
	import { authStore } from '$lib/stores/auth.store';
	import { i18n } from '$lib/stores/i18n.store';
	import { versionStore } from '$lib/stores/version.store';
	import { AUTH_CONFIG_CONTEXT_KEY, type AuthConfigContext } from '$lib/types/auth.context';

	interface Props {
		satellite: MissionControlDid.Satellite;
		children: Snippet;
	}

	let { satellite, children }: Props = $props();

	let satelliteId = $derived(satellite.satellite_id);

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const { setConfig, setRule, state } = getContext<AuthConfigContext>(AUTH_CONFIG_CONTEXT_KEY);

	const loadRule = async () => {
		const result = await getRuleUser({ satelliteId, identity: $authStore.identity });
		setRule(result);
	};

	const loadConfig = async () => {
		const result = await getAuthConfig({
			satelliteId,
			identity: $authStore.identity
		});

		setConfig(result);
	};

	const load = async () => {
		await Promise.all([loadConfig(), loadRule()]);
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

<svelte:window onjunoReloadAuthConfig={load} />

{#if $state === 'initialized'}
	<div in:fade>
		{@render children()}
	</div>
{:else if $state === 'error'}
	<Warning>{$i18n.errors.load_auth_config_error}</Warning>
{:else}
	<SpinnerParagraph>{$i18n.authentication.loading_config}</SpinnerParagraph>
{/if}
