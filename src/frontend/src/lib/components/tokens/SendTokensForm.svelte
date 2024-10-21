<script lang="ts">
	import { isNullish } from '@dfinity/utils';
	import { createEventDispatcher } from 'svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { IC_TRANSACTION_FEE_ICP } from '$lib/constants/constants';
	import { i18n } from '$lib/stores/i18n.store';
	import { toasts } from '$lib/stores/toasts.store';
	import { i18nFormat } from '$lib/utils/i18n.utils';
	import { invalidIcpAddress } from '$lib/utils/icp-account.utils';
	import { formatE8sICP } from '$lib/utils/icp.utils';
	import { invalidIcrcAddress } from '$lib/utils/icrc-account.utils';
	import { amountToICPToken } from '$lib/utils/token.utils';

	export let balance: bigint | undefined;
	export let destination = '';
	export let amount: string | undefined;

	const dispatch = createEventDispatcher();

	const onSubmit = () => {
		if (isNullish(balance) || balance === 0n) {
			toasts.error({
				text: $i18n.errors.empty_balance
			});
			return;
		}

		if (invalidIcrcAddress(destination) && invalidIcpAddress(destination)) {
			toasts.error({
				text: $i18n.errors.invalid_destination
			});
			return;
		}

		if (isNullish(amount)) {
			toasts.error({
				text: $i18n.errors.empty_amount
			});
			return;
		}

		const tokenAmount = amountToICPToken(amount);

		if (isNullish(tokenAmount)) {
			toasts.error({
				text: $i18n.errors.invalid_amount
			});
			return;
		}

		if (balance + IC_TRANSACTION_FEE_ICP < tokenAmount.toE8s()) {
			toasts.error({
				text: $i18n.errors.invalid_amount
			});
			return;
		}

		dispatch('junoReview');
	};
</script>

<h2>{$i18n.wallet.send}</h2>

<p>
	{@html i18nFormat($i18n.wallet.send_information, [
		{
			placeholder: '{0}',
			value: formatE8sICP(balance ?? 0n)
		}
	])}
</p>

<form class="content" on:submit|preventDefault={onSubmit}>
	<div>
		<Value>
			<svelte:fragment slot="label">{$i18n.wallet.destination}</svelte:fragment>
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
			<svelte:fragment slot="label">{$i18n.wallet.icp_amount}</svelte:fragment>
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
