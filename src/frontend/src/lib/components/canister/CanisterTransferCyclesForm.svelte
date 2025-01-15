<script lang="ts">
	import { Principal } from '@dfinity/principal';
	import { nonNullish } from '@dfinity/utils';
	import CanistersPicker from '$lib/components/canister/CanistersPicker.svelte';
	import GridArrow from '$lib/components/ui/GridArrow.svelte';
	import Html from '$lib/components/ui/Html.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { isBusy } from '$lib/stores/busy.store';
	import { i18n } from '$lib/stores/i18n.store';
	import type { CanisterSegmentWithLabel, Segment } from '$lib/types/canister';
	import { formatTCycles, tCyclesToCycles } from '$lib/utils/cycles.utils';
	import { i18nFormat } from '$lib/utils/i18n.utils';

	interface Props {
		segment: CanisterSegmentWithLabel;
		currentCycles: bigint;
		onreview: () => void;
		cycles: bigint;
		destinationId: string | undefined;
	}

	let {
		onreview,
		currentCycles,
		segment,
		cycles = $bindable(0n),
		destinationId = $bindable(undefined)
	}: Props = $props();

	let tCycles: string = $state('');

	let convertedCycles: bigint = $derived(tCyclesToCycles(tCycles));

	$effect(() => {
		cycles = convertedCycles;
	});

	let remainingCycles: bigint = $derived(
		currentCycles - convertedCycles > 0 ? currentCycles - convertedCycles : 0n
	);

	let selectedDestinationId: string | undefined = $state();

	$effect(() => {
		destinationId = selectedDestinationId;
	});

	let validConfirm = $derived(
		convertedCycles > 0 &&
			convertedCycles <= currentCycles &&
			nonNullish(selectedDestinationId) &&
			selectedDestinationId !== ''
	);

	const onSubmit = ($event: SubmitEvent) => {
		$event.preventDefault();

		onreview();
	};
</script>

<h2>
	{$i18n.canisters.transfer_cycles}
</h2>

<p>
	{$i18n.canisters.transfer_cycles_description}
	<Html
		text={i18nFormat($i18n.canisters.your_balance, [
			{
				placeholder: '{0}',
				value: segment.label.replace('_', ' ')
			},
			{
				placeholder: '{1}',
				value: formatTCycles(currentCycles)
			}
		])}
	/>
</p>

<form onsubmit={onSubmit}>
	<div class="columns">
		<div>
			<Value ref="cycles">
				{#snippet label()}
					T Cycles
				{/snippet}

				<Input
					name="cycles"
					inputType="icp"
					required
					bind:value={tCycles}
					placeholder={$i18n.canisters.amount_cycles}
				>
					{#snippet footer()}
						<span class="remaining-cycles">
							<small
								><Html
									text={i18nFormat($i18n.canisters.cycles_will_remain, [
										{
											placeholder: '{0}',
											value: formatTCycles(remainingCycles)
										},
										{
											placeholder: '{1}',
											value: segment.label.replace('_', ' ')
										}
									])}
								/></small
							>
						</span>
					{/snippet}
				</Input>
			</Value>
		</div>

		<GridArrow small />

		<div>
			<Value>
				{#snippet label()}
					{$i18n.canisters.destination}
				{/snippet}

				<CanistersPicker
					excludeSegmentId={Principal.fromText(segment.canisterId)}
					bind:segmentIdText={selectedDestinationId}
				/>
			</Value>
		</div>
	</div>

	<button type="submit" class="submit" disabled={$isBusy || !validConfirm}>
		{$i18n.core.submit}
	</button>
</form>

<style lang="scss">
	@use '../../styles/mixins/media';
	@use '../../styles/mixins/grid';

	.columns {
		@include media.min-width(large) {
			@include grid.two-columns-with-arrow;
		}
	}

	.remaining-cycles {
		display: block;
		padding: var(--padding-0_5x) 0 0;
	}
</style>
