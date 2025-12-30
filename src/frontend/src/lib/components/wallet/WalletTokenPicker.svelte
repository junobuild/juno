<script lang="ts">
	import { quintOut } from 'svelte/easing';
	import { slide } from 'svelte/transition';
	import type { SelectedToken, SelectedWallet } from '$lib/schemas/wallet.schema';
	import { missionControlHasIcp } from '$lib/derived/wallet/balance.derived';
	import { untrack } from 'svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { i18n } from '$lib/stores/app/i18n.store';
	import { CYCLES_TOKEN, ICP_TOKEN } from '$lib/constants/wallet.constants';

	interface Props {
		selectedWallet: SelectedWallet | undefined;
		selectedToken: SelectedToken;
	}

	let { selectedWallet, selectedToken = $bindable(CYCLES_TOKEN) }: Props = $props();

	let resourceType = $state<'cycles' | 'icp'>('cycles');

	$effect(() => {
		selectedWallet;

		resourceType = 'cycles';
	});

	$effect(() => {
		resourceType;

		untrack(() => {
			selectedToken = resourceType === 'icp' ? ICP_TOKEN : CYCLES_TOKEN;
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
