<script lang="ts">
	import { i18n } from '$lib/stores/i18n.store';
	import Confirmation from '$lib/components/core/Confirmation.svelte';

    let visible = false;

    const start = async () => {

    }

    const close = () => visible = false;
</script>

<button on:click={() => visible = true}>{$i18n.canisters.start}</button>

<Confirmation bind:visible on:junoYes={start} on:junoNo={close}>
	<svelte:fragment slot="title">{$i18n.canisters.start_tile}</svelte:fragment>

    <p>{$i18n.canisters.start_info}</p>
</Confirmation>
