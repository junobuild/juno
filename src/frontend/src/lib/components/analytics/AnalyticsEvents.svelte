<script lang="ts">
	import type { AnalyticsTrackEvents } from '$declarations/orbiter/orbiter.did';
	import { i18n } from '$lib/stores/i18n.store';
	import { formatCompactNumber } from '$lib/utils/number.utils.js';

	interface Props {
		trackEvents: AnalyticsTrackEvents;
	}

	let { trackEvents }: Props = $props();

	let allEvents = $derived(trackEvents.total);

	let events: Array<[string, number]> = $derived(
		// eslint-disable-next-line local-rules/prefer-object-params
		allEvents.toSorted(([keyA, _], [keyB, __]) => keyA.localeCompare(keyB))
	);

	let total = $derived(allEvents.reduce((acc, [_, count]) => acc + count, 0));
</script>

<div class="table-container">
	<table>
		<thead>
			<tr>
				<th> {$i18n.analytics.tracked_events} </th>
				<th class="count"> {$i18n.analytics.count} </th>
			</tr>
		</thead>

		<tbody>
			{#each events as [name, count] (name)}
				{@const ratio = total > 0 ? `--ratio: ${(count * 100) / total}%` : undefined}

				<tr>
					<td>{name}</td>
					<td class="count"
						><span style={ratio} class="progress">{formatCompactNumber(count)}</span></td
					>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<style lang="scss">
	.table-container {
		margin: var(--padding-4x) 0;
	}

	.progress {
		position: relative;
		width: 100%;
		display: inline-block;

		&:before {
			content: '';

			position: absolute;
			top: 0;
			right: calc(var(--padding) * -1);

			display: block;

			background: rgba(var(--color-primary-rgb), 0.2);
			border-radius: var(--border-radius);

			width: calc(var(--ratio) + var(--padding));
			height: 100%;
		}
	}

	.count {
		text-align: right;
	}
</style>
