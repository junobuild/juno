<script lang="ts">
	import { Principal } from '@dfinity/principal';
	import { nonNullish } from '@dfinity/utils';
	import { onMount } from 'svelte';
	import { orbiterSatellitesConfig } from '$lib/derived/orbiter-satellites.derived';
	import { pageSatelliteId } from '$lib/derived/page.derived.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import type { SatelliteIdText } from '$lib/types/satellite';
	import { navigateToAnalytics } from '$lib/utils/nav.utils';

	const navigate = async () =>
		await navigateToAnalytics(
			nonNullish(satelliteIdText) ? Principal.fromText(satelliteIdText) : undefined
		);

	let satelliteIdText: SatelliteIdText | undefined = $state();

	let satellites: { satelliteId: string; satName: string }[] = $derived(
		Object.entries($orbiterSatellitesConfig).reduce(
			(acc, [satelliteId, { name: satName, enabled }]) => [
				...acc,
				...(enabled
					? [
							{
								satelliteId,
								satName
							}
						]
					: [])
			],
			// eslint-disable-next-line @typescript-eslint/prefer-reduce-type-parameter
			[] as { satelliteId: string; satName: string }[]
		)
	);

	onMount(() => {
		satelliteIdText =
			nonNullish($pageSatelliteId) &&
			satellites.find(({ satelliteId }) => satelliteId === $pageSatelliteId)
				? $pageSatelliteId
				: undefined;
	});
</script>

<select
	id="satellite"
	name="satellite"
	class="big"
	bind:value={satelliteIdText}
	onchange={navigate}
>
	<option value={undefined}>{$i18n.analytics.all_satellites}</option>

	{#each satellites as { satelliteId, satName }}
		<option value={satelliteId}>{satName}</option>
	{/each}
</select>
