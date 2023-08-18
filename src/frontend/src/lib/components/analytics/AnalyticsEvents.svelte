<script lang="ts">
	import type { AnalyticKey, TrackEvent } from '$declarations/orbiter/orbiter.did';
	import { i18n } from '$lib/stores/i18n.store';
	import Value from '$lib/components/ui/Value.svelte';

	export let trackEvents: [AnalyticKey, TrackEvent][] = [];

	let trackEventsSum: Record<string, number> = {};
	$: trackEventsSum = trackEvents.reduce(
		(acc, [_, { name }]) => ({
			...acc,
			[name]: (acc[name] ?? 0) + 1
		}),
		{}
	);
</script>

<div class="table-container">
	<table>
		<thead>
			<tr>
				<th> {$i18n.analytics.tracked_events} </th>
				<th> {$i18n.analytics.count} </th>
			</tr>
		</thead>

		<tbody>
			{#each Object.entries(trackEventsSum) as [name, count]}
				<tr>
					<td>{name}</td>
					<td>{count}</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<style lang="scss">
	.table-container {
		margin: var(--padding-4x) 0;
	}
</style>