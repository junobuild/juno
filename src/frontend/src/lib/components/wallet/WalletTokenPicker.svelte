<script lang="ts">
	import { untrack } from 'svelte';
	import { quintOut } from 'svelte/easing';
	import { slide } from 'svelte/transition';
	import Value from '$lib/components/ui/Value.svelte';
	import { CYCLES, ICP } from '$lib/constants/token.constants';
	import { devHasIcp, missionControlHasIcp } from '$lib/derived/wallet/balance.derived';
	import type { SelectedToken, SelectedWallet } from '$lib/schemas/wallet.schema';
	import { i18n } from '$lib/stores/app/i18n.store';

	interface Props {
		selectedWallet: SelectedWallet | undefined;
		selectedToken: SelectedToken;
	}

	let { selectedWallet, selectedToken = $bindable(CYCLES) }: Props = $props();

	let resourceType = $state<'cycles' | 'icp'>('cycles');

	$effect(() => {
		selectedWallet;

		resourceType = 'cycles';
	});

	$effect(() => {
		resourceType;

		untrack(() => {
			selectedToken = resourceType === 'icp' ? ICP : CYCLES;
		});
	});

	let pickerEnabled = $derived(
		(selectedWallet?.type === 'mission_control' && $missionControlHasIcp) ||
			(selectedWallet?.type === 'dev' && $devHasIcp)
	);
</script>

{#if pickerEnabled}
	<div class="picker" transition:slide={{ delay: 0, duration: 150, easing: quintOut, axis: 'y' }}>
		<Value ref="ledger-id">
			{#snippet label()}
				{$i18n.wallet.resource}
			{/snippet}

			<select id="ledger-id" name="ledger-id" bind:value={resourceType}>
				<option value="cycles">Cycles</option>
				<option value="icp">ICP</option>
			</select>
		</Value>
	</div>
{/if}

<style lang="scss">
	.picker {
		margin: 0 0 var(--padding-1_5x);
	}
</style>
