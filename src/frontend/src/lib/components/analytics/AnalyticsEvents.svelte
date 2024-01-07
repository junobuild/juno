<script lang="ts">
	import type { AnalyticsTrackEvents } from '$declarations/orbiter/orbiter.did';
	import { i18n } from '$lib/stores/i18n.store';

	export let trackEvents: AnalyticsTrackEvents;

	let total: Array<[string, number]>;
	$: ({ total } = trackEvents);
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
			{#each total as [name, count]}
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
