<script lang="ts">
	import InputCycles from '$lib/components/core/InputCycles.svelte';
	import { CYCLES_TOP_UP_FEE } from '$lib/constants/token.constants';

	interface Props {
		balance: bigint;
		amount: string | undefined;
		displayTCycles: string | undefined;
	}

	let {
		balance,
		amount = $bindable(undefined),
		displayTCycles = $bindable(undefined)
	}: Props = $props();

	$effect(() => {
		displayTCycles = amount;
	});
</script>

<InputCycles {balance} fee={CYCLES_TOP_UP_FEE} bind:amount />
