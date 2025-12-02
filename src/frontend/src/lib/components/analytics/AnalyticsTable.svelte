<script lang="ts">
	import type { Snippet } from 'svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import { formatCompactNumber } from '$lib/utils/number.utils';

	interface Props {
		children: Snippet;
		events: [string, number][];
		display?: 'number' | 'percent';
		withTitle?: boolean;
	}

	let { events, children, display = 'number', withTitle }: Props = $props();

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
				{@const title = withTitle ? name : undefined}

				<tr>
					<td
						><span class="stack"><span style={ratio} class="progress" {title}>{name}</span></span>
					</td>
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
	@use '../../styles/mixins/text';
	@use '../../styles/mixins/media';

	.stack {
		position: relative;
		z-index: 1;
	}

	.progress {
		position: relative;
		width: 100%;
		display: block;

		@include text.truncate;

		&:before {
			content: '';

			position: absolute;
			top: 0;
			left: calc(var(--padding) * -1);

			display: block;

			background: rgba(var(--color-secondary-rgb), 0.5);
			border-radius: var(--border-radius);

			width: calc(var(--ratio) + var(--padding));
			height: 100%;

			z-index: -1;
		}
	}

	@include media.dark-theme {
		.progress {
			&:before {
				background: rgba(var(--color-tertiary-rgb), 0.85);
			}
		}
	}

	.count {
		text-align: right;
		width: 35%;
	}
</style>
