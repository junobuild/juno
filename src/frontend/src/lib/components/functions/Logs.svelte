<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import { getContext, onMount, setContext } from 'svelte';
	import { isNullish, nonNullish } from '@dfinity/utils';
	import { authStore } from '$lib/stores/auth.store';
	import { i18n } from '$lib/stores/i18n.store';
	import { fade } from 'svelte/transition';
	import Log from '$lib/components/functions/Log.svelte';
	import { listLogs } from '$lib/services/logs.services';
	import type { Log as LogType } from '$lib/types/log';
	import SpinnerParagraph from '$lib/components/ui/SpinnerParagraph.svelte';
	import { PAGINATION_CONTEXT_KEY, type PaginationContext } from '$lib/types/pagination.context';
	import { initPaginationContext } from '$lib/stores/pagination.store';
	import DataCount from '$lib/components/data/DataCount.svelte';

	export let satelliteId: Principal;

	const list = async () => {
		const { results, error } = await listLogs({
			satelliteId,
			identity: $authStore.identity
		});

		if (nonNullish(error)) {
			setItems({ items: undefined, matches_length: undefined, items_length: undefined });
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

	let empty = false;
	$: empty = $store.items?.length === 0;
</script>

<div class="table-container">
	<table>
		<thead>
			<tr>
				<th class="level"> {$i18n.functions.level} </th>
				<th class="timestamp"> {$i18n.functions.timestamp} </th>
				<th class="message"> {$i18n.functions.message} </th>
			</tr>
		</thead>

		<tbody>
			{#if isNullish($store.items)}
				<tr
					><td colspan="3"><SpinnerParagraph>{$i18n.functions.loading_logs}</SpinnerParagraph></td
					></tr
				>
			{:else if empty}
				<tr in:fade><td colspan="3">{$i18n.functions.empty}</td></tr>
			{:else}
				{#each $store.items as [_, log]}
					<Log {log} />
				{/each}
			{/if}
		</tbody>
	</table>
</div>

<DataCount />

<style lang="scss">
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

	.timestamp {
		width: 200px;
	}

	.level {
		width: 88px;
	}
</style>
