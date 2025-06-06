<script module lang="ts">
	export interface SatellitePickerProps {
		disabled?: boolean;
		navigate: (satelliteId: Principal | undefined) => Promise<void>;
		satellites: { satelliteId: string; satName: string }[];
	}
</script>

<script lang="ts">
	import { Principal } from '@dfinity/principal';
	import { nonNullish } from '@dfinity/utils';
	import { onMount } from 'svelte';
	import { pageSatelliteId } from '$lib/derived/page.derived.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import type { SatelliteIdText } from '$lib/types/satellite';

	let { disabled = false, navigate, satellites }: SatellitePickerProps = $props();

	let satelliteIdText: SatelliteIdText | undefined = $state(undefined);

	const onchange = async () =>
		await navigate(nonNullish(satelliteIdText) ? Principal.fromText(satelliteIdText) : undefined);

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
	{onchange}
	{disabled}
>
	<option value={undefined}>{$i18n.analytics.all_satellites}</option>

	{#each satellites as { satelliteId, satName } (satName)}
		<option value={satelliteId}>{satName}</option>
	{/each}
</select>
