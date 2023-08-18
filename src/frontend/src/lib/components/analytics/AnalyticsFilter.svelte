<script lang="ts">
	import { i18n } from '$lib/stores/i18n.store';
	import Value from '$lib/components/ui/Value.svelte';
	import SatellitesPicker from '$lib/components/satellites/SatellitesPicker.svelte';
	import { createEventDispatcher } from 'svelte';
	import { nonNullish } from '$lib/utils/utils';
	import type { PageViewsPeriod } from '$lib/types/ortbiter';

	let from = '';
	let to = '';

	const dispatch = createEventDispatcher();

	const onChange = () =>
		dispatch('junoPeriod', {
			from: nonNullish(from) && from !== '' ? new Date(from) : undefined,
			to: nonNullish(to) && to !== '' ? new Date(to) : undefined
		} as PageViewsPeriod);
</script>

<div class="filters">
	<div class="satellites">
		<Value>
			<svelte:fragment slot="label">{$i18n.analytics.satellites}</svelte:fragment>
			<SatellitesPicker />
		</Value>
	</div>

	<div>
		<Value ref="from">
			<svelte:fragment slot="label">{$i18n.core.from}</svelte:fragment>

			<input bind:value={from} id="from" name="from" type="date" on:change={onChange} />
		</Value>
	</div>

	<div>
		<Value ref="to">
			<svelte:fragment slot="label">{$i18n.core.to}</svelte:fragment>

			<input bind:value={to} id="to" name="to" type="date" on:change={onChange} />
		</Value>
	</div>
</div>

<style lang="scss">
	@use '../../styles/mixins/grid';
	@use '../../styles/mixins/media';

	.filters {
		display: grid;
		grid-template-columns: repeat(2, calc((100% - var(--padding-1_5x)) / 2));

		gap: var(--padding-1_5x);
		padding: 0 0 var(--padding-2x);

		@include media.min-width(large) {
			grid-template-columns: repeat(3, calc((100% - (2 * var(--padding-4x))) / 3));

			gap: var(--padding-4x);
		}
	}

	.satellites {
		grid-column: 1 / 3;

		@include media.min-width(large) {
			grid-column: 1 / 2;
		}
	}
</style>
