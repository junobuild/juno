<script lang="ts">
	import IconWallet from '$lib/components/icons/IconWallet.svelte';
	import ReceiveTokens from '$lib/components/tokens/ReceiveTokens.svelte';
	import ButtonIcon from '$lib/components/ui/ButtonIcon.svelte';
	import Popover from '$lib/components/ui/Popover.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import WalletActions from '$lib/components/wallet/WalletActions.svelte';
	import WalletIds from '$lib/components/wallet/WalletIds.svelte';
	import WalletInlineBalance from '$lib/components/wallet/WalletInlineBalance.svelte';
	import { balance } from '$lib/derived/balance.derived';
	import { i18n } from '$lib/stores/i18n.store';
	import type { MissionControlId } from '$lib/types/mission-control';

	interface Props {
		missionControlId: MissionControlId;
	}

	let { missionControlId }: Props = $props();

	let button: HTMLButtonElement | undefined = $state();
	let visible: boolean = $state(false);

	const onclick = () => (visible = true);

	let receiveVisible = $state(false);

	const openReceive = () => {
		visible = false;
		receiveVisible = true;
	};
</script>

<ButtonIcon {onclick} bind:button>
	{#snippet icon()}
		<IconWallet size="16px" />
	{/snippet}

	{$i18n.wallet.title}
</ButtonIcon>

<Popover anchor={button} direction="rtl" bind:visible>
	<div class="container">
		<div>
			<Value>
				{#snippet label()}
					{$i18n.wallet.balance}
				{/snippet}

				<WalletInlineBalance balance={$balance} />
			</Value>
		</div>

		<WalletIds {missionControlId} />

		<div class="actions">
			<WalletActions {missionControlId} onreceive={openReceive} onsend={() => (visible = false)} />
		</div>
	</div>
</Popover>

<ReceiveTokens {missionControlId} bind:visible={receiveVisible} />

<style lang="scss">
	@use '../../styles/mixins/overlay';

	@include overlay.popover-container;

	.container {
		font-size: var(--font-size-small);
		row-gap: var(--padding);
	}

	div {
		:global(p) {
			margin: 0;
		}
	}

	.actions {
		margin: var(--padding) 0 0;
	}
</style>
