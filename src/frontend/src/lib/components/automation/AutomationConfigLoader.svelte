<script lang="ts">
	import { getContext, type Snippet, untrack } from 'svelte';
	import { fade } from 'svelte/transition';
	import SpinnerParagraph from '$lib/components/ui/SpinnerParagraph.svelte';
	import Warning from '$lib/components/ui/Warning.svelte';
	import { authIdentity } from '$lib/derived/auth.derived';
	import { getAuthConfig } from '$lib/services/console/auth/auth.config.services';
	import { getRuleUser } from '$lib/services/satellite/collection.services';
	import { i18n } from '$lib/stores/app/i18n.store';
	import { versionStore } from '$lib/stores/version.store';
	import { AUTH_CONFIG_CONTEXT_KEY, type AuthConfigContext } from '$lib/types/auth.context';
	import type { Satellite } from '$lib/types/satellite';
	import {
		AUTOMATION_CONFIG_CONTEXT_KEY,
		type AutomationConfigContext
	} from '$lib/types/automation.context';
	import { getAutomationConfig } from '$lib/services/satellite/automation.config.services';

	interface Props {
		satellite: Satellite;
		children: Snippet;
	}

	let { satellite, children }: Props = $props();

	let satelliteId = $derived(satellite.satellite_id);

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const { setConfig, state } = getContext<AutomationConfigContext>(AUTOMATION_CONFIG_CONTEXT_KEY);

	const loadConfig = async () => {
		const result = await getAutomationConfig({
			satelliteId,
			identity: $authIdentity
		});

		setConfig(result);
	};

	const load = async () => {
		await loadConfig();
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
	<Warning>{$i18n.errors.load_automation_config_error}</Warning>
{:else}
	<SpinnerParagraph>{$i18n.core.loading_config}</SpinnerParagraph>
{/if}
