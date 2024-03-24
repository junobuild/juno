<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import { onMount } from 'svelte';
	import { isNullish, nonNullish } from '@dfinity/utils';
	import { authStore } from '$lib/stores/auth.store';
	import { i18n } from '$lib/stores/i18n.store';
	import { fade } from 'svelte/transition';
	import Log from '$lib/components/functions/Log.svelte';
	import { listLogs } from '$lib/services/logs.services';
	import type { Log as LogType } from '$lib/types/log';

	export let satelliteId: Principal;

	let logs: LogType[] | undefined;

	const list = async () => {
		const { results, error } = await listLogs({
			satelliteId,
			identity: $authStore.identity
		});

		if (nonNullish(error)) {
			return;
		}

		logs = results ?? [];
	};

	onMount(async () => await list());

	let empty = false;
	$: empty = logs?.length === 0;
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
			{#if isNullish(logs)}
				<tr><td colspan="3">&ZeroWidthSpace;</td></tr>
			{:else if empty}
				<tr in:fade><td colspan="3">{$i18n.functions.empty}</td></tr>
			{:else}
				{#each logs as log}
					<Log {log} />
				{/each}
			{/if}
		</tbody>
	</table>
</div>

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
