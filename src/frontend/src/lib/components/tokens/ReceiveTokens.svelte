<script lang="ts">
	import Popover from '$lib/components/ui/Popover.svelte';
    import { i18n } from '$lib/stores/i18n.store';
    import IconQRCode from "$lib/components/icons/IconQRCode.svelte";

	export let visible = false;
</script>

<Popover bind:visible center={true} backdrop="dark">
	<div class="container">
        <h3>{$i18n.wallet.receive}</h3>

        <div class="wallet">
            <button><IconQRCode /> {$i18n.wallet.wallet_id}</button>

            <button><IconQRCode /> {$i18n.wallet.account_identifier}</button>

            <p>Or connect wallet</p>
        </div>
    </div>
</Popover>

<style lang="scss">
	@use '../../styles/mixins/overlay';

	@include overlay.popover-container;

    .wallet {
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
