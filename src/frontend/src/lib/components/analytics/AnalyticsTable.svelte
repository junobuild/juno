<script lang="ts">
	import type { Snippet } from 'svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import { formatCompactNumber } from '$lib/utils/number.utils.js';

	interface Props {
		children: Snippet;
		events: [string, number][];
		display?: 'number' | 'percent';
	}

	let { events, children, display = 'number' }: Props = $props();

	let total = $derived(events.reduce((acc, [_, count]) => acc + count, 0));
</script>

<div class="table-container">
	<table>
		<thead>
			<tr>
				<th> {@render children()} </th>
				<th class="count"> {$i18n.analytics.count} </th>
			</tr>
		</thead>

		<tbody>
			{#each events as [name, count] (name)}
				{@const ratio = total > 0 ? `--ratio: ${(count * 100) / total}%` : undefined}

				<tr>
					<td><span style={ratio} class="progress">{name}</span></td>
					<td class="count">
						{#if display === 'percent'}
							{count > 0 ? (count * 100).toFixed(2) : 0}<small>%</small>
						{:else}
							{formatCompactNumber(count)}
						{/if}
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<style lang="scss">
	.progress {
		position: relative;
		width: 100%;
		display: inline-block;

		&:before {
			content: '';

			position: absolute;
			top: 0;
			left: calc(var(--padding) * -1);

			display: block;

			background: rgba(var(--color-primary-rgb), 0.1);
			border-radius: var(--border-radius);

			width: calc(var(--ratio) + var(--padding));
			height: 100%;
		}
	}

	.count {
		text-align: right;
		width: 35%;
	}
</style>
