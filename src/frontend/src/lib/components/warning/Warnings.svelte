<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import type { MissionControlDid } from '$declarations';
	import CanisterWarnings from '$lib/components/canister/CanisterWarnings.svelte';
	import LoaderWarnings from '$lib/components/warning/LoaderWarnings.svelte';
	import VersionWarnings from '$lib/components/warning/VersionWarnings.svelte';
	import { missionControlIdDerived } from '$lib/derived/mission-control.derived';
	import { orbiterStore } from '$lib/derived/orbiter.derived';
	import { i18n } from '$lib/stores/i18n.store';

	interface Props {
		satellite?: MissionControlDid.Satellite | undefined;
	}

	let { satellite = undefined }: Props = $props();
</script>

<VersionWarnings {satellite} />

{#if nonNullish($missionControlIdDerived)}
	<LoaderWarnings canisterId={$missionControlIdDerived}>
		{#snippet cycles()}
			{$i18n.canisters.warning_mission_control_low_cycles}
		{/snippet}
	</LoaderWarnings>
{/if}

{#if nonNullish(satellite)}
	<CanisterWarnings canisterId={satellite.satellite_id}>
		{#snippet cycles()}
			{$i18n.canisters.warning_satellite_low_cycles}
		{/snippet}
		{#snippet heap()}
			{$i18n.canisters.warning_satellite_heap_memory}
		{/snippet}
	</CanisterWarnings>
{/if}

{#if nonNullish($orbiterStore)}
	<LoaderWarnings canisterId={$orbiterStore.orbiter_id}>
		{#snippet cycles()}
			{$i18n.canisters.warning_orbiter_low_cycles}
		{/snippet}
		{#snippet heap()}
			{$i18n.canisters.warning_orbiter_heap_memory}
		{/snippet}
	</LoaderWarnings>
{/if}
