<script lang="ts">
	import { i18n } from '$lib/stores/i18n.store';
	import SpinnerParagraph from '$lib/components/ui/SpinnerParagraph.svelte';
	import { getContext, onMount } from 'svelte';
	import { fromNullable, isNullish } from '@dfinity/utils';
	import { getStatuses } from '$lib/api/observatory.api';
	import { toasts } from '$lib/stores/toasts.store';
	import Value from '$lib/components/ui/Value.svelte';
	import { fade } from 'svelte/transition';
	import { formatToDate } from '$lib/utils/date.utils';
	import { TABS_CONTEXT_KEY, type TabsContext } from '$lib/types/tabs.context';
	import type { Statuses } from '$lib/types/observatory';
	import ObservatoryData from '$lib/components/observatory/ObservatoryData.svelte';

	let loading = true;

	let timestamp: bigint | undefined;
	let statuses: Statuses | undefined;

	const loadStatuses = async () => {
		try {
			const results = fromNullable(await getStatuses());

			timestamp = results?.timestamp;
			statuses = results?.statuses;

			loading = false;
		} catch (err: unknown) {
			toasts.error({
				text: $i18n.errors.observatory_get_unexpected_error,
				detail: err
			});
		}
	};

	onMount(async () => await loadStatuses());

	const { store } = getContext<TabsContext>(TABS_CONTEXT_KEY);
</script>

{#if loading}
	<SpinnerParagraph>{$i18n.core.loading}</SpinnerParagraph>
{:else if isNullish(timestamp) || isNullish(statuses)}
	<div class="card-container" in:fade>
		<p>
			{$i18n.observatory.disabled_go_settings}
			<button on:click={() => store.update((state) => ({ ...state, tabId: state.tabs[1].id }))}
				>{$i18n.core.settings}</button
			>
		</p>
	</div>
{:else}
	<div in:fade>
		<div class="card-container">
			<Value>
				<svelte:fragment slot="label">{$i18n.observatory.last_data_collection}</svelte:fragment>
				<p>{formatToDate(timestamp)}</p>
			</Value>
		</div>

		<ObservatoryData {statuses} />
	</div>
{/if}
