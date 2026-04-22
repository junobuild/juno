<script lang="ts">
	import { isEmptyString } from '@dfinity/utils';
	import CanisterTopUpFormIcp from '$lib/components/modules/canister/top-up/CanisterTopUpFormIcp.svelte';
	import Html from '$lib/components/ui/Html.svelte';
	import { ICP } from '$lib/constants/token.constants';
	import {
		devIcpBalanceOrZero,
		missionControlIcpBalanceOrZero
	} from '$lib/derived/wallet/balance.derived';
	import type { SelectedWallet } from '$lib/schemas/wallet.schema';
	import { i18n } from '$lib/stores/app/i18n.store';
	import { i18nFormat } from '$lib/utils/i18n.utils';
	import { assertAndConvertAmountToToken, formatToken } from '$lib/utils/token.utils';

	interface Props {
		selectedWallet: SelectedWallet;
		balance: bigint;
		amount: string | undefined;
		displayTCycles: string | undefined;
		onreview: () => void;
	}

	let {
		onreview,
		selectedWallet,
		balance = $bindable(0n),
		amount = $bindable(undefined),
		displayTCycles = $bindable(undefined)
	}: Props = $props();

	$effect(() => {
		balance =
			selectedWallet?.type === 'mission_control'
				? $missionControlIcpBalanceOrZero
				: $devIcpBalanceOrZero;
	});

	const onSubmit = ($event: SubmitEvent) => {
		$event.preventDefault();

		const { valid } = assertAndConvertAmountToToken({
			balance,
			amount,
			token: ICP.token,
			fee: ICP.fees.topUp
		});

		if (!valid) {
			return;
		}

		onreview();
	};
</script>

<h2>
	{$i18n.wallet.convert_title}
</h2>

<p>
	<Html
		text={i18nFormat($i18n.wallet.convert_description, [
			{
				placeholder: '{0}',
				value:
					selectedWallet.type === 'mission_control' ? $i18n.mission_control.title : $i18n.wallet.dev
			},
			{
				placeholder: '{1}',
				value: formatToken({ selectedToken: ICP, amount: balance ?? 0n, withSymbol: true })
			}
		])}
	/>
</p>

<form onsubmit={onSubmit}>
	<div class="group-cycles">
		<CanisterTopUpFormIcp {balance} bind:amount bind:displayTCycles />
	</div>

	<button disabled={isEmptyString(amount)} type="submit">{$i18n.core.review}</button>
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

	p {
		min-height: 24px;
	}

	.group-cycles {
		@include media.min-width(large) {
			grid-column: 1 / 3;
		}
	}
</style>
