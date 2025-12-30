<script lang="ts">
	import InputCycles from '$lib/components/core/InputCycles.svelte';
	import InputIcp from '$lib/components/core/InputIcp.svelte';
	import Html from '$lib/components/ui/Html.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import type { SelectedToken, SelectedWallet } from '$lib/schemas/wallet.schema';
	import { i18n } from '$lib/stores/app/i18n.store';
	import { toasts } from '$lib/stores/app/toasts.store';
	import { i18nFormat } from '$lib/utils/i18n.utils';
	import { invalidIcpAddress } from '$lib/utils/icp-account.utils';
	import { invalidIcrcAddress } from '$lib/utils/icrc-account.utils';
	import {
		assertAndConvertAmountToToken,
		formatToken,
		isTokenCycles,
		isTokenIcp
	} from '$lib/utils/token.utils';

	interface Props {
		selectedWallet: SelectedWallet;
		selectedToken: SelectedToken;
		balance: bigint | undefined;
		destination?: string;
		amount: string | undefined;
		onreview: () => void;
	}

	let {
		balance,
		selectedWallet,
		selectedToken,
		destination = $bindable(''),
		amount = $bindable(),
		onreview
	}: Props = $props();

	const onSubmit = ($event: SubmitEvent) => {
		$event.preventDefault();

		if (
			isTokenIcp(selectedToken) &&
			invalidIcrcAddress(destination) &&
			invalidIcpAddress(destination)
		) {
			toasts.error({
				text: $i18n.errors.invalid_destination
			});
			return;
		}

		if (isTokenCycles(selectedToken) && invalidIcrcAddress(destination)) {
			toasts.error({
				text: $i18n.errors.invalid_destination
			});
			return;
		}

		const { valid } = assertAndConvertAmountToToken({
			balance,
			amount,
			token: selectedToken.token,
			fee: selectedToken.fee
		});

		if (!valid) {
			return;
		}

		onreview();
	};

	let InputAmount = $derived(isTokenIcp(selectedToken) ? InputIcp : InputCycles);
</script>

<h2>{$i18n.wallet.send}</h2>

<p>
	<Html
		text={i18nFormat($i18n.wallet.send_information, [
			{
				placeholder: '{0}',
				value: isTokenIcp(selectedToken) ? 'ICP' : 'Cycles'
			},
			{
				placeholder: '{1}',
				value:
					selectedWallet.type === 'mission_control' ? $i18n.mission_control.title : $i18n.wallet.dev
			},
			{
				placeholder: '{2}',
				value: formatToken({ selectedToken, amount: balance ?? 0n, withSymbol: true })
			}
		])}
	/>
</p>

<form class="content" onsubmit={onSubmit}>
	<div>
		<Value>
			{#snippet label()}
				{$i18n.wallet.destination}
			{/snippet}

			<Input
				name="destination"
				inputType="text"
				placeholder={$i18n.wallet.destination_placeholder}
				bind:value={destination}
			/>
		</Value>
	</div>

	<InputAmount {balance} bind:amount />

	<button class="action" type="submit">
		{$i18n.core.review}
	</button>
</form>

<style lang="scss">
	@use '../../../styles/mixins/media';
	@use '../../../styles/mixins/grid';

	form {
		margin: var(--padding-4x) 0;

		@include media.min-width(large) {
			@include grid.two-columns;
		}
	}

	button {
		margin-top: var(--padding);
	}
</style>
