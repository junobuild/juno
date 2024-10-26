<script lang="ts">
	import { isNullish } from '@dfinity/utils';
	import { createEventDispatcher } from 'svelte';
	import { preventDefault } from 'svelte/legacy';
	import Html from '$lib/components/ui/Html.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import { toasts } from '$lib/stores/toasts.store';
	import { i18nFormat } from '$lib/utils/i18n.utils';
	import { invalidIcpAddress } from '$lib/utils/icp-account.utils';
	import { formatE8sICP } from '$lib/utils/icp.utils';
	import { invalidIcrcAddress } from '$lib/utils/icrc-account.utils';
	import { assertAndConvertAmountToICPToken } from '$lib/utils/token.utils';

	interface Props {
		balance: bigint | undefined;
		destination?: string;
		amount: string | undefined;
	}

	let { balance, destination = $bindable(''), amount = $bindable() }: Props = $props();

	const dispatch = createEventDispatcher();

	const onSubmit = () => {
		if (invalidIcrcAddress(destination) && invalidIcpAddress(destination)) {
			toasts.error({
				text: $i18n.errors.invalid_destination
			});
			return;
		}

		const { valid } = assertAndConvertAmountToICPToken({
			balance,
			amount
		});

		if (!valid) {
			return;
		}

		dispatch('junoReview');
	};
</script>

<h2>{$i18n.wallet.send}</h2>

<p>
	<Html
		text={i18nFormat($i18n.wallet.send_information, [
			{
				placeholder: '{0}',
				value: formatE8sICP(balance ?? 0n)
			}
		])}
	/>
</p>

<form class="content" onsubmit={preventDefault(onSubmit)}>
	<div>
		<Value>
			{#snippet label()}
				{$i18n.wallet.destination}
			{/snippet}
			<Input
				inputType="text"
				name="destination"
				placeholder={$i18n.wallet.destination_placeholder}
				bind:value={destination}
			/>
		</Value>
	</div>

	<div>
		<Value>
			{#snippet label()}
				{$i18n.wallet.icp_amount}
			{/snippet}
			<Input
				name="amount"
				inputType="currency"
				required
				bind:value={amount}
				spellcheck={false}
				placeholder={$i18n.wallet.amount_placeholder}
			/>
		</Value>
	</div>

	<button type="submit">
		{$i18n.core.review}
	</button>
</form>

<style lang="scss">
	form {
		margin: var(--padding-4x) 0;
	}

	div {
		margin-bottom: var(--padding);
	}
</style>
