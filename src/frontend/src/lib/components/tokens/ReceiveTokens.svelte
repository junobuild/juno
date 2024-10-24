<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import { run } from 'svelte/legacy';
	import { fade } from 'svelte/transition';
	import { getAccountIdentifier } from '$lib/api/icp-index.api';
	import IconQRCode from '$lib/components/icons/IconQRCode.svelte';
	import ReceiveTokensQRCode from '$lib/components/tokens/ReceiveTokensQRCode.svelte';
	import Popover from '$lib/components/ui/Popover.svelte';
	import { i18n } from '$lib/stores/i18n.store';

	interface Props {
		missionControlId: Principal;
		visible?: boolean;
	}

	let { missionControlId, visible = $bindable(false) }: Props = $props();

	const accountIdentifier = getAccountIdentifier(missionControlId);

	let steps: 'options' | 'wallet_id' | 'account_identifier' = $state('options');

	run(() => {
		// @ts-expect-error TODO: to be migrated to Svelte v5
		visible, (steps = 'options');
	});
</script>

<Popover bind:visible center={true} backdrop="dark">
	<div class="container">
		<h3>{$i18n.wallet.receive}</h3>

		{#if steps === 'wallet_id'}
			<div in:fade>
				<ReceiveTokensQRCode
					on:junoBack={() => (steps = 'options')}
					value={missionControlId.toText()}
					ariaLabel={$i18n.wallet.wallet_id}
				/>
			</div>
		{:else if steps === 'account_identifier'}
			<div in:fade>
				<ReceiveTokensQRCode
					on:junoBack={() => (steps = 'options')}
					value={accountIdentifier.toHex()}
					ariaLabel={$i18n.wallet.account_identifier}
				/>
			</div>
		{:else}
			<div class="options">
				<button onclick={() => (steps = 'wallet_id')}
					><IconQRCode /> {$i18n.wallet.wallet_id}</button
				>

				<button onclick={() => (steps = 'account_identifier')}
					><IconQRCode /> {$i18n.wallet.account_identifier}</button
				>

				<!-- <p>Or connect wallet</p> -->
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

		padding: var(--padding-2x) 0;
	}
</style>
