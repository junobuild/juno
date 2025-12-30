<script lang="ts">
	import { quintOut } from 'svelte/easing';
	import { slide } from 'svelte/transition';
	import type { IndexIdText, LedgerIdText, SelectedWallet } from '$lib/schemas/wallet.schema';
	import {
		CYCLES_INDEX_CANISTER_ID,
		CYCLES_LEDGER_CANISTER_ID,
		ICP_INDEX_CANISTER_ID,
		ICP_LEDGER_CANISTER_ID
	} from '$lib/constants/app.constants';
	import { missionControlHasIcp } from '$lib/derived/wallet/balance.derived';
	import { untrack } from 'svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { i18n } from '$lib/stores/app/i18n.store';

	interface Props {
		selectedWallet: SelectedWallet | undefined;
		ledgerId: LedgerIdText;
		indexId: IndexIdText;
	}

	let {
		selectedWallet,
		ledgerId = $bindable(CYCLES_LEDGER_CANISTER_ID),
		indexId = $bindable(CYCLES_INDEX_CANISTER_ID)
	}: Props = $props();

	let resourceType = $state<'cycles' | 'icp'>('cycles');

	$effect(() => {
		resourceType;

		untrack(() => {
			ledgerId = resourceType === 'icp' ? ICP_LEDGER_CANISTER_ID : CYCLES_LEDGER_CANISTER_ID;
			indexId = resourceType === 'icp' ? ICP_INDEX_CANISTER_ID : CYCLES_INDEX_CANISTER_ID;
		});
	});
</script>

{#if selectedWallet?.type === 'mission_control' && $missionControlHasIcp}
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