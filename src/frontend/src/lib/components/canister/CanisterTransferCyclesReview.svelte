<script lang="ts">
	import { Principal } from '@dfinity/principal';
	import { nonNullish } from '@dfinity/utils';
	import Segment from '$lib/components/segments/Segment.svelte';
	import GridArrow from '$lib/components/ui/GridArrow.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { missionControlIdDerived } from '$lib/derived/mission-control.derived';
	import { orbiterStore } from '$lib/derived/orbiter.derived';
	import { satellitesStore } from '$lib/derived/satellites.derived';
	import { i18n } from '$lib/stores/i18n.store';
	import { formatTCycles } from '$lib/utils/cycles.utils';
	import { satelliteName } from '$lib/utils/satellite.utils';

	interface Props {
		cycles: bigint;
		destinationId: string | undefined;
		onback: () => void;
		onsubmit: ($event: SubmitEvent) => Promise<void>;
	}

	let { onsubmit, onback, cycles, destinationId }: Props = $props();

	let satellite = $derived(
		($satellitesStore ?? []).find(({ satellite_id }) => satellite_id.toText() === destinationId)
	);
</script>

<h2>{$i18n.canisters.transfer_cycles}</h2>

<p>{$i18n.canisters.review_and_confirm_transfer_cycles}</p>

<form {onsubmit}>
	<div class="columns">
		<div class="card-container with-title">
			<span class="title">{$i18n.core.from}</span>

			<div class="content">
				<Value>
					{#snippet label()}
						T Cycles
					{/snippet}

					<p>
						{formatTCycles(cycles)}
					</p>
				</Value>
			</div>
		</div>

		<GridArrow />

		<div class="card-container with-title primary">
			<span class="title">{$i18n.core.to}</span>

			<div class="content">
				<Value>
					{#snippet label()}
						{$i18n.canisters.destination}
					{/snippet}

					<p>
						{#if nonNullish($missionControlIdDerived) && $missionControlIdDerived.toText() === destinationId}
							<Segment id={Principal.fromText(destinationId)}>
								{$i18n.mission_control.title}
							</Segment>
						{:else if nonNullish($orbiterStore) && $orbiterStore.orbiter_id.toText() === destinationId}
							<Segment id={Principal.fromText(destinationId)}>
								{$i18n.analytics.title}
							</Segment>
						{:else if nonNullish(satellite)}
							<Segment id={satellite.satellite_id}>
								{satelliteName(satellite)}
							</Segment>
						{:else}
							{destinationId ?? ''}
						{/if}
					</p>
				</Value>
			</div>
		</div>
	</div>

	<div class="toolbar">
		<button type="button" onclick={onback}>{$i18n.core.back}</button>
		<button type="submit">{$i18n.core.confirm}</button>
	</div>
</form>

<style lang="scss">
	@use '../../styles/mixins/grid';

	.columns {
		@include grid.two-columns-with-arrow;
	}
</style>
