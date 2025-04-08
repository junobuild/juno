<script lang="ts">
	import { onMount, type Snippet } from 'svelte';
	import type { Satellite } from '$declarations/mission_control/mission_control.did';
	import SpinnerParagraph from '$lib/components/ui/SpinnerParagraph.svelte';
	import { loadVersion } from '$lib/services/version.loader.services';
	import { authStore } from '$lib/stores/auth.store';
	import { i18n } from '$lib/stores/i18n.store';
	import type { MissionControlId } from '$lib/types/mission-control';

	interface Props {
		missionControlId: MissionControlId;
		satellite: Satellite;
		children: Snippet;
	}

	let { missionControlId, satellite, children }: Props = $props();

	let firstLoadInProgress = $state(true);

	const load = async (skipReload: boolean) => {
		await loadVersion({
			satelliteId: satellite.satellite_id,
			missionControlId,
			skipReload,
			identity: $authStore.identity
		});

		firstLoadInProgress = false;
	};

	onMount(() => {
		load(true);
	});
</script>

<svelte:window onjunoReloadVersions={async () => await load(false)} />

{#if firstLoadInProgress}
	<SpinnerParagraph>{$i18n.core.loading_version}</SpinnerParagraph>
{:else}
	{@render children()}
{/if}
