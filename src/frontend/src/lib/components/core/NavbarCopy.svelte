<script lang="ts">
	import IconArrowDropDown from '$lib/components/icons/IconArrowDropDown.svelte';
	import Copy from '$lib/components/ui/Copy.svelte';
	import Popover from '$lib/components/ui/Popover.svelte';
	import WalletIds from '$lib/components/wallet/WalletIds.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import type { MissionControlId } from '$lib/types/mission-control';

	interface Props {
		missionControlId: MissionControlId;
	}

	let { missionControlId }: Props = $props();

	let button: HTMLButtonElement | undefined = $state();
	let visible: boolean = $state(false);
</script>

<div class="ids">
	<Copy value={missionControlId.toText()} variant="text" what={$i18n.wallet.wallet_id} />

	<button class="text more" onclick={() => (visible = true)} bind:this={button}
		><IconArrowDropDown size="16px" /></button
	>
</div>

<Popover bind:visible anchor={button} direction="rtl">
	<div class="container">
		<WalletIds {missionControlId} />
	</div>
</Popover>

<style lang="scss">
	@use '../../styles/mixins/overlay';

	@include overlay.popover-container;

	.container {
		padding: var(--padding-1_5x) var(--padding-2x) 0;

		font-size: var(--font-size-small);
	}

	.ids {
		display: flex;
		align-items: center;

		font-size: var(--font-size-small);

		padding: 0.25rem 0.5rem;
		border-radius: var(--border-radius);

		border: 1px solid var(--text-color);

		:global(button:first-of-type) {
			min-width: 24px;
			margin: 0;
		}
	}

	.more {
		margin: 0;
	}
</style>
