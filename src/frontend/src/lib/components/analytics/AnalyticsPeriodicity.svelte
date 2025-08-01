<script lang="ts">
	import IconScience from '$lib/components/icons/IconScience.svelte';
	import Popover from '$lib/components/ui/Popover.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { analyticsFiltersStore } from '$lib/stores/analytics-filters.store';
	import { i18n } from '$lib/stores/i18n.store';
	import type { AnalyticsPeriodicity } from '$lib/types/orbiter';
	import { setLocalStorageItem } from '$lib/utils/local-storage.utils';

	interface Props {
		selectPeriodicity: (periodicity: AnalyticsPeriodicity) => void;
		disabled: boolean;
	}

	let { selectPeriodicity, disabled }: Props = $props();

	let visible: boolean = $state(false);

	let periodicity = $state<AnalyticsPeriodicity>($analyticsFiltersStore.periodicity);

	const open = ($event: MouseEvent | TouchEvent) => {
		$event.stopPropagation();

		visible = true;
	};

	const handleSubmit = ($event: SubmitEvent) => {
		$event.preventDefault();

		selectPeriodicity(periodicity);

		setLocalStorageItem({ key: 'analytics_periodicity', value: JSON.stringify({ periodicity }) });

		visible = false;
	};
</script>

<button class="square" {disabled} onclick={open}>
	<IconScience />
	<span class="visually-hidden">{$i18n.analytics.adjust_periodicity}</span>
</button>

<Popover backdrop="dark" center bind:visible>
	<form class="container" onsubmit={handleSubmit}>
		<Value>
			{#snippet label()}
				{$i18n.analytics.periodicity}
			{/snippet}
			<select bind:value={periodicity}>
				<option value={4}> {$i18n.analytics.four_hours} </option>
				<option value={8}> {$i18n.analytics.eight_hours} </option>
				<option value={12}> {$i18n.analytics.half_day} </option>
				<option value={24}> {$i18n.analytics.one_day} </option>
				<option value={168}> {$i18n.analytics.a_week} </option>
				<option value={720}> {$i18n.analytics.a_month} </option>
			</select>
		</Value>

		<p>
			{$i18n.analytics.why_periodicity}
		</p>

		<p>
			{$i18n.analytics.periodicity_impact}
		</p>

		<button type="submit">
			{$i18n.core.apply}
		</button>
	</form>
</Popover>

<style lang="scss">
	@use '../../styles/mixins/dialog';
	@use '../../styles/mixins/text';

	.square {
		margin: var(--padding) 0 var(--padding-2x);
		align-self: center;
	}

	@include dialog.edit;

	p {
		font-style: italic;
	}
</style>
