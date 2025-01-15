<script lang="ts">
	import { i18n } from '$lib/stores/i18n.store';
	import GridArrow from '$lib/components/ui/GridArrow.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { formatTCycles } from '$lib/utils/cycles.utils';

	interface Props {
		cycles: bigint;
		destinationId: string | undefined;
		onback: () => void;
		onsubmit: ($event: SubmitEvent) => Promise<void>;
	}

	let { onsubmit, onback, cycles, destinationId }: Props = $props();
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
						{destinationId ?? ''}
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
