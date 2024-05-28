<script lang="ts">
	import Popover from '$lib/components/ui/Popover.svelte';
	import IconMore from '$lib/components/icons/IconMore.svelte';
	import { i18n } from '$lib/stores/i18n.store';

	export let visible: boolean | undefined = undefined;

	let button: HTMLButtonElement | undefined;
</script>

<svelte:window on:junoCloseActions={() => (visible = false)} />

<button
	class="icon"
	aria-label={$i18n.core.more}
	type="button"
	on:click={() => (visible = true)}
	bind:this={button}><IconMore size="20px" /></button
>

<Popover bind:visible anchor={button} direction="rtl">
	<div class="container">
		<slot />
	</div>
</Popover>

<style lang="scss">
	@use '../../styles/mixins/overlay';

	@include overlay.popover-container;

	button.icon {
		padding: 0;
	}
</style>
