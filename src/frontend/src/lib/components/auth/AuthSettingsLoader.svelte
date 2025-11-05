<script lang="ts">
	import { getContext, type Snippet, untrack } from 'svelte';
	import type { MissionControlDid } from '$declarations';
	import { getRuleUser } from '$lib/services/collection.services';
	import { getAuthConfig } from '$lib/services/auth/auth.config.services';
	import { authStore } from '$lib/stores/auth.store';
	import { versionStore } from '$lib/stores/version.store';
	import { AUTH_CONFIG_CONTEXT_KEY, type AuthConfigContext } from '$lib/types/auth.context';

	interface Props {
		satellite: MissionControlDid.Satellite;
		children: Snippet;
	}

	let { satellite, children }: Props = $props();

	let satelliteId = $derived(satellite.satellite_id);

	const { setConfig, setRule } = getContext<AuthConfigContext>(AUTH_CONFIG_CONTEXT_KEY);

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

		untrack(() => {
			load();
		});
	});
</script>

<svelte:window onjunoReloadAuthConfig={load} />

{@render children()}
