<script lang="ts" module>
	export interface SatellitePickerProps {
		disabled?: boolean;
		onChange: (satelliteId: Principal | undefined) => void;
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

	let { disabled = false, onChange, satellites }: SatellitePickerProps = $props();

	let satelliteIdText = $state<SatelliteIdText | undefined>(undefined);

	const onSelect = () =>
		onChange(nonNullish(satelliteIdText) ? Principal.fromText(satelliteIdText) : undefined);

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
	{disabled}
	onchange={onSelect}
	bind:value={satelliteIdText}
>
	<option value={undefined}>{$i18n.analytics.all_satellites}</option>

	{#each satellites as { satelliteId, satName } (satName)}
		<option value={satelliteId}>{satName}</option>
	{/each}
</select>
