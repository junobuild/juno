<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import { nonNullish, type TokenAmountV2 } from '@dfinity/utils';
	import { formatE8sICP } from '$lib/utils/icp.utils';
	import Value from '$lib/components/ui/Value.svelte';
	import Identifier from '$lib/components/ui/Identifier.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import { getAccountIdentifier } from '$lib/api/icp-index.api';
	import { AccountIdentifier } from '@dfinity/ledger-icp';
	import { amountToICPToken } from '$lib/utils/token.utils';
	import { IC_TRANSACTION_FEE_ICP } from '$lib/constants/constants';
	import { createEventDispatcher } from 'svelte';
	import { wizardBusy } from '$lib/stores/busy.store';
	import { authStore } from '$lib/stores/auth.store';
	import { sendTokens } from '$lib/services/tokens.services';

	export let missionControlId: Principal;
	export let balance: bigint | undefined;
	export let destination = '';
	export let amount: string | undefined;

	let accountIdentifier: AccountIdentifier | undefined;
	$: accountIdentifier = getAccountIdentifier(missionControlId);

	let token: TokenAmountV2 | undefined;
	$: token = amountToICPToken(amount);

	const dispatch = createEventDispatcher();

	const onSubmit = async () => {
		wizardBusy.start();

		dispatch('junoNext', 'in_progress');

		try {
			await sendTokens({
				missionControlId,
				identity: $authStore.identity,
				destination,
				token
			});

			dispatch('junoNext', 'ready');
		} catch (err: unknown) {
			dispatch('junoNext', 'error');
		}

		wizardBusy.stop();
	};
</script>

<h2>{$i18n.wallet.send}</h2>

<p>{$i18n.wallet.review_and_confirm}</p>

<form on:submit|preventDefault={onSubmit}>
	<div class="columns">
		<div class="card-container with-title from">
			<span class="title">{$i18n.wallet.tx_from}</span>

			<div class="content">
				<Value>
					<svelte:fragment slot="label">{$i18n.wallet.wallet_id}</svelte:fragment>
					<p class="identifier">
						<Identifier shorten={false} identifier={missionControlId.toText()} />
					</p>
				</Value>

				<Value>
					<svelte:fragment slot="label">{$i18n.wallet.account_identifier}</svelte:fragment>
					<p class="identifier">
						<Identifier identifier={accountIdentifier?.toHex() ?? ''} />
					</p>
				</Value>

				<Value>
					<svelte:fragment slot="label">{$i18n.wallet.balance}</svelte:fragment>
					<p>
						{#if nonNullish(balance)}<span>{formatE8sICP(balance)} <small>ICP</small></span>{/if}
					</p>
				</Value>
			</div>
		</div>

		<div class="card-container with-title">
			<span class="title">{$i18n.wallet.tx_to}</span>

			<div class="content">
				<Value>
					<svelte:fragment slot="label">{$i18n.wallet.destination}</svelte:fragment>
					<p class="identifier">
						<Identifier identifier={destination} />
					</p>
				</Value>
			</div>
		</div>

		<div class="card-container with-title sending">
			<span class="title">{$i18n.wallet.sending}</span>

			<div class="content">
				<Value>
					<svelte:fragment slot="label">{$i18n.wallet.tx_amount}</svelte:fragment>
					<p>
						{#if nonNullish(token)}<span>{formatE8sICP(token.toE8s())} <small>ICP</small></span
							>{/if}
					</p>
				</Value>

				<Value>
					<svelte:fragment slot="label">{$i18n.wallet.fee}</svelte:fragment>
					<p>
						<span>{formatE8sICP(IC_TRANSACTION_FEE_ICP)} <small>ICP</small></span>
					</p>
				</Value>
			</div>
		</div>
	</div>

	<div class="toolbar">
		<button type="button" on:click={() => dispatch('junoNext', 'form')}>{$i18n.core.back}</button>
		<button type="submit">{$i18n.core.confirm}</button>
	</div>
</form>

<style lang="scss">
	@use '../../styles/mixins/media';

	.columns {
		@include media.min-width(large) {
			display: grid;
			grid-template-columns: repeat(2, calc((100% - var(--padding-2x)) / 2));
			grid-column-gap: var(--padding-2x);
		}
	}

	.from {
		grid-row-start: 1;
		grid-row-end: 3;
	}

	.sending {
		grid-column-start: 2;
		grid-column-end: 3;
	}

	.identifier {
		margin: 0 0 var(--padding);
	}
</style>
