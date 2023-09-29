<script lang="ts">
    import { i18n } from '$lib/stores/i18n.store';
    import Confirmation from '$lib/components/core/Confirmation.svelte';

    let visible = false;

    const stop = async () => {

    }

    const close = () => visible = false;
</script>

<button on:click={() => visible = true}>{$i18n.canisters.stop}</button>

<Confirmation bind:visible on:junoYes={stop} on:junoNo={close}>
    <svelte:fragment slot="title">{$i18n.canisters.stop_title}</svelte:fragment>

    <p>{$i18n.canisters.stop_info}</p>

    <p>{$i18n.canisters.stop_explanation}</p>
</Confirmation>
