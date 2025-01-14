<script lang="ts">
	import SendTokensMax from '$lib/components/tokens/SendTokensMax.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { i18n } from '$lib/stores/i18n.store';

	interface Props {
		balance: bigint | undefined;
		amount: string | undefined;
	}

	let { amount = $bindable(), balance }: Props = $props();
</script>

<div>
	<Value>
		{#snippet label()}
			{$i18n.core.icp_amount}
		{/snippet}

		<Input
			name="amount"
			inputType="currency"
			required
			bind:value={amount}
			spellcheck={false}
			placeholder={$i18n.wallet.amount_placeholder}
		>
			{#snippet end()}
				<SendTokensMax {balance} onmax={(value) => (amount = value)} />
			{/snippet}
		</Input>
	</Value>
</div>
