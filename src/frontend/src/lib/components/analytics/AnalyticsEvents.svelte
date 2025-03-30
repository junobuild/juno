<script lang="ts">
	import type { AnalyticsTrackEvents } from '$declarations/orbiter/orbiter.did';
	import { i18n } from '$lib/stores/i18n.store';

	interface Props {
		trackEvents: AnalyticsTrackEvents;
	}

	let { trackEvents }: Props = $props();

	let total: Array<[string, number]> = $state([]);

	$effect(() => {
		const { total: t } = trackEvents;
		t.sort(([keyA, _], [keyB, __]) => keyA.localeCompare(keyB));

		total = t;
	});
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
			{#each total as [name, count] (name)}
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
