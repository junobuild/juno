<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import type { Principal } from '@icp-sdk/core/principal';
	import { getContext } from 'svelte';
	import IconRefresh from '$lib/components/icons/IconRefresh.svelte';
	import WorkflowFilter from '$lib/components/satellites/automation/workflows/WorkflowFilter.svelte';
	import WorkflowRow from '$lib/components/satellites/automation/workflows/WorkflowRow.svelte';
	import DataActions from '$lib/components/satellites/data/DataActions.svelte';
	import DataCount from '$lib/components/satellites/data/DataCount.svelte';
	import DataOrder from '$lib/components/satellites/data/DataOrder.svelte';
	import DataPaginator from '$lib/components/satellites/data/DataPaginator.svelte';
	import { i18n } from '$lib/stores/app/i18n.store';
	import { PAGINATION_CONTEXT_KEY, type PaginationContext } from '$lib/types/pagination.context';
	import type { Workflow } from '$lib/types/workflow';

	interface Props {
		reload: () => void;
	}

	let { reload }: Props = $props();

	const { store: paginationStore }: PaginationContext<Workflow> =
		getContext<PaginationContext<Workflow>>(PAGINATION_CONTEXT_KEY);

	let empty = $derived($paginationStore.items?.length === 0);

	let innerWidth = $state(0);

	let colspan = $derived(innerWidth >= 576 ? 3 : 2);
</script>

<svelte:window bind:innerWidth />

<div class="table-container">
	<table>
		<thead>
			<tr>
				<th {colspan}>
					<div class="actions">
						<WorkflowFilter />
						<DataOrder />

						<DataActions>
							<button class="menu" onclick={reload} type="button"
								><IconRefresh size="20px" /> {$i18n.core.reload}</button
							>
						</DataActions>
					</div>
				</th>
			</tr>
			<tr>
				<th class="workflow"> {$i18n.automation.workflow} </th>
				<th class="reference"> {$i18n.automation.reference} </th>
				<th class="timestamp"> {$i18n.automation.timestamp} </th>
			</tr>
		</thead>

		<tbody>
			{#if nonNullish($paginationStore.items)}
				{#each $paginationStore.items as [key, workflow] (key)}
					<WorkflowRow {key} {workflow} />
				{/each}

				{#if !empty && ($paginationStore.pages ?? 0) > 1}
					<tr><td {colspan}><DataPaginator /></td></tr>
				{/if}

				{#if empty}
					<tr><td {colspan}>{$i18n.automation.empty}</td></tr>
				{/if}
			{/if}
		</tbody>
	</table>
</div>

<DataCount />

<style lang="scss">
	@use '../../../../styles/mixins/media';

	table {
		table-layout: auto;
	}

	.workflow,
	.reference {
		width: 35%;
	}

	.timestamp {
		width: 30%;
		text-align: right;
	}

	.timestamp {
		display: none;

		@include media.min-width(small) {
			display: table-cell;
		}
	}
</style>
