<script lang="ts">
	import { satelliteIdStore, satellitesStore } from '$lib/stores/satellite.store';
	import { navigateToAnalytics } from '$lib/utils/nav.utils';
	import { satelliteName } from '$lib/utils/satellite.utils';
	import { Principal } from '@dfinity/principal';
	import { i18n } from '$lib/stores/i18n.store';
	import type { SatelliteIdText } from '$lib/types/satellite';
	import { nonNullish } from '$lib/utils/utils';
	import { onMount } from 'svelte';

	const navigate = async () =>
		await navigateToAnalytics(
			nonNullish(satelliteIdText) ? Principal.fromText(satelliteIdText) : undefined
		);

	let satelliteIdText: SatelliteIdText | undefined;

	onMount(() => (satelliteIdText = $satelliteIdStore));
</script>

<select id="satellite" name="satellite" bind:value={satelliteIdText} on:change={navigate}>
	<option value={undefined}>{$i18n.analytics.all_satellites}</option>

	{#each $satellitesStore ?? [] as satellite}
		{@const satName = satelliteName(satellite)}

		<option value={satellite.satellite_id.toText()}>{satName}</option>
	{/each}
</select>
