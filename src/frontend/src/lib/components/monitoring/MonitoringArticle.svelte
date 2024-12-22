<script lang="ts">
	import { fromNullable, isNullish, nonNullish } from '@dfinity/utils';
	import type { Snippet } from 'svelte';
	import type { Monitoring } from '$declarations/mission_control/mission_control.did';
	import type { Principal } from '@dfinity/principal';
	import CanisterMonitoringLoader from '$lib/components/loaders/CanisterMonitoringLoader.svelte';
	import type { ChartsData } from '$lib/types/chart';
	import type { Segment } from '$lib/types/canister';
	import Chart from '$lib/components/charts/Chart.svelte';

	interface Props {
		children: Snippet;
		monitoring: Monitoring | undefined;
		canisterId: Principal;
		segment: Segment;
	}

	let { children, monitoring, segment, canisterId }: Props = $props();

	let enabled = $derived(fromNullable(monitoring?.cycles ?? [])?.enabled === true);

	let chartsData: ChartsData[] = $state([]);

	$inspect(chartsData);
</script>

<CanisterMonitoringLoader {segment} {canisterId} bind:chartsData>
	<button onclick={() => console.log('todo')} class="article monitoring">
		<span class="segment">
			{@render children()}
		</span>

		{#if enabled}
			<span class="chart-container">
				<Chart {chartsData} axis={false} padding={{ top: 0, right: 0, bottom: 0, left: 0 }} />
			</span>
		{:else}
			<span>Monitoring disabled.</span>
		{/if}
	</button>
</CanisterMonitoringLoader>

<style lang="scss">
	@use '../../styles/mixins/media';

	.segment {
		display: flex;
		align-items: center;
		gap: var(--padding);
	}

	button.article.monitoring {
		grid-column: 1 / 13;
		align-items: center;

		padding: var(--padding-2x) var(--padding-4x);

		@include media.min-width(medium) {
			display: grid;
			grid-template-columns: 30% auto;
			grid-gap: var(--padding);
		}
	}

	.chart-container {
		height: 100%;
		width: 100px;
		fill: var(--value-color);
	}
</style>
