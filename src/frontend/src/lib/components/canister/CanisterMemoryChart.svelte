<script lang="ts">
	import ChartRadar from '$lib/components/charts/ChartRadar.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import type { CanisterDataInfo, Segment } from '$lib/types/canister';

	interface Props {
		canister: CanisterDataInfo | undefined;
		segment: Segment;
	}

	let { canister, segment }: Props = $props();

	let memoryMetrics = $derived(canister?.memoryMetrics);

	let wasmMemorySize = $derived(memoryMetrics?.wasmMemorySize);
	let stableMemorySize = $derived(memoryMetrics?.stableMemorySize);
	let globalMemorySize = $derived(memoryMetrics?.globalMemorySize);
	let wasmBinarySize = $derived(memoryMetrics?.wasmBinarySize);
	let wasmChunkStoreSize = $derived(memoryMetrics?.wasmChunkStoreSize);
	let customSectionsSize = $derived(memoryMetrics?.customSectionsSize);
	let canisterHistorySize = $derived(memoryMetrics?.canisterHistorySize);
	let snapshotsSize = $derived(memoryMetrics?.snapshotsSize);

	const ONE_MB = 1000 * 1000;
	const ONE_KB = 1000;

	const chartsData = $derived({
		[$i18n.canisters.on_heap]: Number(wasmMemorySize ?? 0n),
		[$i18n.canisters.on_stable]: Number(stableMemorySize ?? 0n),
		...((globalMemorySize ?? 0n) > ONE_MB && {
			[$i18n.canisters.in_global]: Number(globalMemorySize ?? 0n)
		}),
		...(['mission_control'].includes(segment) &&
			(wasmChunkStoreSize ?? 0n) > 0n && {
				[$i18n.canisters.in_chunks]: Number(wasmChunkStoreSize ?? 0n)
			}),
		...((snapshotsSize ?? 0n) > 0n && {
			[$i18n.canisters.on_snapshot]: Number(snapshotsSize ?? 0n)
		}),
		[$i18n.canisters.of_custom_sections]: Number(customSectionsSize ?? 0n),
		[$i18n.canisters.of_code]: Number(wasmBinarySize ?? 0n),
		...((canisterHistorySize ?? 0n) > ONE_KB && {
			[$i18n.canisters.in_history]: Number(canisterHistorySize ?? 0n)
		})
	});
</script>

<div class="chart-container">
	<ChartRadar {chartsData} />
</div>

<style lang="scss">
	@use '../../styles/mixins/media';

	.chart-container {
		height: 175px;
		width: 100%;

		margin: 0 0 var(--padding-6x);

		@include media.min-width(medium) {
			height: 150px;
			width: 300px;

			position: absolute;
			transform: translate(-20%);
		}
	}
</style>
