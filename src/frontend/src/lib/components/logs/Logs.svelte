<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import { isNullish, nonNullish } from '@dfinity/utils';
	import { getContext, onMount, setContext } from 'svelte';
	import { run } from 'svelte/legacy';
	import { fade } from 'svelte/transition';
	import DataCount from '$lib/components/data/DataCount.svelte';
	import Log from '$lib/components/logs/Log.svelte';
	import LogsFilter from '$lib/components/logs/LogsFilter.svelte';
	import LogsOrder from '$lib/components/logs/LogsOrder.svelte';
	import LogsRefresh from '$lib/components/logs/LogsRefresh.svelte';
	import SpinnerParagraph from '$lib/components/ui/SpinnerParagraph.svelte';
	import { listLogs } from '$lib/services/logs.services';
	import { authStore } from '$lib/stores/auth.store';
	import { i18n } from '$lib/stores/i18n.store';
	import { initPaginationContext } from '$lib/stores/pagination.store';
	import type { Log as LogType, LogLevel as LogLevelType } from '$lib/types/log';
	import { PAGINATION_CONTEXT_KEY, type PaginationContext } from '$lib/types/pagination.context';

	interface Props {
		satelliteId: Principal;
	}

	let { satelliteId }: Props = $props();

	let desc = $state(true);
	let levels: LogLevelType[] = $state(['Info', 'Debug', 'Warning', 'Error', 'Unknown']);

	const list = async () => {
		const { results, error } = await listLogs({
			satelliteId,
			identity: $authStore.identity,
			desc,
			levels
		});

		if (nonNullish(error)) {
			setItems({ items: [], matches_length: 0n, items_length: 0n });
			return;
		}

		let length = nonNullish(results) ? BigInt(results.length) : undefined;

		setItems({ items: results, matches_length: length, items_length: length });
	};

	setContext<PaginationContext<LogType>>(PAGINATION_CONTEXT_KEY, {
		...initPaginationContext(),
		list
	});
	const { store, setItems }: PaginationContext<LogType> =
		getContext<PaginationContext<LogType>>(PAGINATION_CONTEXT_KEY);

	onMount(async () => await list());

	let empty = $state(false);
	run(() => {
		empty = $store.items?.length === 0;
	});

	let innerWidth = $state(0);
</script>

<svelte:window bind:innerWidth />

<div class="table-container">
	<table>
		<thead>
			<tr>
				<th colspan={innerWidth >= 768 ? 3 : 0}>
					<div class="actions">
						<LogsFilter bind:levels />
						<LogsOrder bind:desc />
						<LogsRefresh />
					</div>
				</th>
			</tr>
			<tr>
				<th class="level">
					{$i18n.functions.level}
				</th>
				<th class="timestamp">
					{$i18n.functions.timestamp}
				</th>
				<th class="message"> {$i18n.functions.message} </th>
			</tr>
		</thead>

		<tbody>
			{#if isNullish($store.items)}
				<tr
					><td colspan={innerWidth >= 768 ? 3 : 0}
						><SpinnerParagraph>{$i18n.functions.loading_logs}</SpinnerParagraph></td
					></tr
				>
			{:else if empty}
				<tr in:fade
					><td colspan={innerWidth >= 768 ? 3 : 0}
						><span class="empty">{$i18n.functions.empty}</span></td
					></tr
				>
			{:else}
				{#each $store.items as [key, log] (key)}
					<Log {log} />
				{/each}
			{/if}
		</tbody>
	</table>
</div>

<DataCount />

<style lang="scss">
	@use '../../styles/mixins/media';

	table {
		table-layout: auto;
	}

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

	.table-container {
		padding: 0 0 var(--padding);

		--spinner-paragraph-margin: var(--padding) 0 0;
	}

	tbody {
		font-size: var(--font-size-small);
	}

	td {
		padding: var(--padding-0_25x) var(--padding-2x);
	}

	.empty {
		display: inline-block;
		padding: var(--padding) 0 0;
	}

	.timestamp {
		width: 200px;
	}

	.level {
		width: 88px;
	}

	.actions {
		display: flex;
		gap: var(--padding-1_5x);
		padding: var(--padding) 0;
	}
</style>
