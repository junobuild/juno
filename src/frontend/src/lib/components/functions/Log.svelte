<script lang="ts">
	import type { canister_log_record } from '$declarations/ic/ic.did';
	import { formatToDate } from '$lib/utils/date.utils';
	import { onMount } from 'svelte';
	import { isNullish } from '@dfinity/utils';
	import { i18n } from '$lib/stores/i18n.store';
	import IconChevron from '$lib/components/icons/IconChevron.svelte';
	import LogLevel from "$lib/components/functions/LogLevel.svelte";

	export let log: canister_log_record;

	let content: string | undefined;
	onMount(async () => {
		const blob: Blob = new Blob([
			log.content instanceof Uint8Array ? log.content : new Uint8Array(log.content)
		]);
		content = await blob.text();
	});

	let expand = false;
</script>

<tr>
	<td class="timestamp"><span>{formatToDate(log.timestamp_nanos)}</span></td>
	<td class="level"><LogLevel /></td>
	<td class="content"
		><button
			class="text"
			class:rotate={expand}
			aria-label={$i18n.functions.expand}
			on:click={() => (expand = !expand)}><IconChevron /></button
		>
		<div class:expand>
			{#if isNullish(content)}&ZeroWidthSpace;{:else}{content}

				<p class="info" class:expand>
					{formatToDate(log.timestamp_nanos)} | <LogLevel />
				</p>
			{/if}
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

	.message {
		width: 100%;
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
		animation: rotate 0.5s ease-out;

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

		span {
			padding: var(--padding-0_5x) 0;
			display: inline-block;
		}
	}

	.info {
		display: none;
		font-size: var(--font-size-very-small);
		padding: var(--padding-2x) 0 0;

		&.expand {
			display: block;
		}

		@include media.min-width(medium) {
			&.expand {
				display: none;
			}
		}
	}
</style>
