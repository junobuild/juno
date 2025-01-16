<script lang="ts">
	import type { TokenAmountV2 } from '@dfinity/utils';
	import SendTokensAmount from '$lib/components/tokens/SendTokensAmount.svelte';
	import GridArrow from '$lib/components/ui/GridArrow.svelte';
	import Identifier from '$lib/components/ui/Identifier.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import WalletSendFrom from '$lib/components/wallet/WalletSendFrom.svelte';
	import { IC_TRANSACTION_FEE_ICP } from '$lib/constants/constants';
	import { sendTokens } from '$lib/services/tokens.services';
	import { authStore } from '$lib/stores/auth.store';
	import { wizardBusy } from '$lib/stores/busy.store';
	import { i18n } from '$lib/stores/i18n.store';
	import type { MissionControlId } from '$lib/types/mission-control';
	import { formatICP } from '$lib/utils/icp.utils';
	import { amountToICPToken } from '$lib/utils/token.utils';

	interface Props {
		missionControlId: MissionControlId;
		balance: bigint | undefined;
		destination?: string;
		amount: string | undefined;
		onnext: (steps: 'form' | 'in_progress' | 'ready' | 'error') => void;
	}

	let {
		missionControlId,
		balance,
		destination = $bindable(''),
		amount = $bindable(),
		onnext
	}: Props = $props();

	let token: TokenAmountV2 | undefined = $derived(amountToICPToken(amount));

	const onSubmit = async ($event: SubmitEvent) => {
		$event.preventDefault();

		wizardBusy.start();

		onnext('in_progress');

		try {
			await sendTokens({
				missionControlId,
				identity: $authStore.identity,
				destination,
				token
			});

			onnext('ready');
		} catch (err: unknown) {
			onnext('error');
		}

		wizardBusy.stop();
	};
</script>

<h2>{$i18n.wallet.send}</h2>

<p>{$i18n.wallet.review_and_confirm}</p>

<form onsubmit={onSubmit}>
	<div class="columns">
		<WalletSendFrom {missionControlId} {balance} />

		<GridArrow />

		<div class="card-container with-title primary">
			<span class="title">{$i18n.wallet.tx_to}</span>

			<div class="content">
				<Value>
					{#snippet label()}
						{$i18n.wallet.destination}
					{/snippet}
					<p class="identifier">
						<Identifier identifier={destination} />
					</p>
				</Value>
			</div>
		</div>

		<div class="card-container with-title sending tertiary">
			<span class="title">{$i18n.wallet.sending}</span>

			<div class="content">
				<SendTokensAmount {token} />

				<Value>
					{#snippet label()}
						{$i18n.core.fee}
					{/snippet}
					<p>
						<span>{formatICP(IC_TRANSACTION_FEE_ICP)} <small>ICP</small></span>
					</p>
				</Value>
			</div>
		</div>
	</div>

	<div class="toolbar">
		<button type="button" onclick={() => onnext('form')}>{$i18n.core.back}</button>
		<button type="submit">{$i18n.core.confirm}</button>
	</div>
</form>

<style lang="scss">
	@use '../../styles/mixins/grid';

	.columns {
		@include grid.two-columns-with-arrow;
	}

	.sending {
		grid-column-start: 3;
		grid-column-end: 4;
	}

	.identifier {
		margin: 0 0 var(--padding);
	}
</style>
