<script lang="ts">
	import Input from '$lib/components/ui/Input.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { i18n } from '$lib/stores/i18n.store';

	interface Props {

	}

    let minTCycles: string = $state('');
    let fundTCycles: string = $state('');
</script>

<h2>{$i18n.monitoring.title}</h2>

<p>{$i18n.monitoring.threshold_info}</p>

<Value ref="mint-cycles">
	{#snippet label()}
		Remaining Cycles Threshold
	{/snippet}

	<Input
		name="cycles"
		inputType="icp"
		required
		bind:value={minTCycles}
		placeholder={$i18n.canisters.amount_cycles}
	/>
</Value>

<Value ref="fund-cycles">
	{#snippet label()}
		Top-Up Amount
	{/snippet}

	<Input
		name="cycles"
		inputType="icp"
		required
		bind:value={minTCycles}
		placeholder={$i18n.canisters.amount_cycles}
	/>
</Value>
