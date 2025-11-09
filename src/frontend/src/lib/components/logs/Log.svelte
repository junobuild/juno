<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import IconChevron from '$lib/components/icons/IconChevron.svelte';
	import LogLevel from '$lib/components/logs/LogLevel.svelte';
	import JsonCode from '$lib/components/ui/JsonCode.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import type { Log } from '$lib/types/log';
	import { formatToDate } from '$lib/utils/date.utils';

	interface Props {
		log: Log;
	}

	let { log }: Props = $props();

	let expand = $state(false);
</script>

<tr>
	<td class="level"><LogLevel {log} /></td>
	<td class="timestamp"><span>{formatToDate(log.timestamp)}</span></td>
	<td class="content"
		><button
			class="text"
			class:rotate={expand}
			aria-label={$i18n.functions.expand}
			onclick={() => (expand = !expand)}><IconChevron /></button
		>
		<div class:expand>
			{log.message}

			{#if nonNullish(log.data)}
				<output class="info" class:expand>
					<JsonCode json={log.data} />
				</output>
			{/if}

			<p class="info hide-wide-screen" class:expand>
				<LogLevel {log} /> | {formatToDate(log.timestamp)}
			</p>
		</div>
	</td>
</tr>

<style lang="scss">
	@use '../../styles/mixins/text';
	@use '../../styles/mixins/media';

	.timestamp,
	.level {
		display: none;
	}

	@include media.min-width(medium) {
		.timestamp,
		.level {
			display: table-cell;
		}
	}

	td {
		padding: var(--padding-0_25x) var(--padding-2x);
		vertical-align: top;
	}

	.expand {
		white-space: normal;
	}

	.content {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: var(--padding-0_5x);
	}

	button.text {
		margin: 0;

		&.rotate {
			transform: rotate(90deg);
		}
	}

	div {
		padding: var(--padding-0_5x) 0;
		@include text.truncate;
	}

	.timestamp,
	.level {
		overflow: visible;
	}

	.info {
		display: none;
		font-size: var(--font-size-very-small);
		padding: var(--padding) 0 0;

		&.expand {
			display: block;
		}

		@include media.min-width(medium) {
			&.hide-wide-screen.expand {
				display: none;
			}
		}
	}

	output {
		margin: var(--padding) 0 var(--padding-2x);
	}

	.timestamp span {
		margin: var(--padding-0_5x) 0 0;
		display: block;
	}
</style>
