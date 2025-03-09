<script lang="ts">
	import { fade } from 'svelte/transition';
	import { getAccountIdentifier } from '$lib/api/icp-index.api';
	import IconOisy from '$lib/components/icons/IconOisy.svelte';
	import IconQRCode from '$lib/components/icons/IconQRCode.svelte';
	import ReceiveTokensQRCode from '$lib/components/tokens/ReceiveTokensQRCode.svelte';
	import ReceiveTokensSigner from '$lib/components/tokens/ReceiveTokensSigner.svelte';
	import Popover from '$lib/components/ui/Popover.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import type { MissionControlId } from '$lib/types/mission-control';

	interface Props {
		missionControlId: MissionControlId;
		visible?: boolean;
	}

	let { missionControlId, visible = $bindable(false) }: Props = $props();

	const accountIdentifier = getAccountIdentifier(missionControlId);

	let step: 'options' | 'wallet_id' | 'account_identifier' | 'signer' = $state('options');

	$effect(() => {
		visible;
		step = 'options';
	});
</script>

<Popover bind:visible center={true} backdrop="dark">
	<div class="container">
		<h3>{$i18n.wallet.receive}</h3>

		{#if step === 'wallet_id'}
			<div in:fade>
				<ReceiveTokensQRCode
					back={() => (step = 'options')}
					value={missionControlId.toText()}
					ariaLabel={$i18n.wallet.wallet_id}
				/>
			</div>
		{:else if step === 'account_identifier'}
			<div in:fade>
				<ReceiveTokensQRCode
					back={() => (step = 'options')}
					value={accountIdentifier.toHex()}
					ariaLabel={$i18n.wallet.account_identifier}
				/>
			</div>
		{:else if step === 'signer'}
			<div in:fade>
				<ReceiveTokensSigner {missionControlId} bind:visible back={() => (step = 'options')} />
			</div>
		{:else}
			<div class="options">
				<button onclick={() => (step = 'wallet_id')}><IconQRCode /> {$i18n.wallet.wallet_id}</button
				>

				<button onclick={() => (step = 'account_identifier')}
					><IconQRCode /> {$i18n.wallet.account_identifier}</button
				>

				<p>{$i18n.wallet.or_connect_wallet}</p>

				<button onclick={() => (step = 'signer')}><IconOisy /> OISY</button>
			</div>
		{/if}
	</div>
</Popover>

<style lang="scss">
	@use '../../styles/mixins/overlay';

	@include overlay.popover-container;

	.options {
		display: flex;
		flex-direction: column;
	}

	button {
		display: flex;
		justify-content: flex-start;
		gap: var(--padding);

		width: 100%;
	}

	p {
		font-size: var(--font-size-small);
		text-align: center;

		padding: var(--padding-2x) 0 0;
		margin: 0 0 var(--padding-1_5x);
	}
</style>
