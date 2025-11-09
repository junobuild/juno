<script lang="ts">
	import type { Snippet } from 'svelte';
	import IconMore from '$lib/components/icons/IconMore.svelte';
	import Popover from '$lib/components/ui/Popover.svelte';
	import { i18n } from '$lib/stores/i18n.store';

	interface Props {
		visible?: boolean | undefined;
		children: Snippet;
	}

	let { visible = $bindable(false), children }: Props = $props();

	let button: HTMLButtonElement | undefined = $state();
</script>

<svelte:window onjunoCloseActions={() => (visible = false)} />

<button
	bind:this={button}
	class="icon"
	aria-label={$i18n.core.more}
	onclick={() => (visible = true)}
	type="button"><IconMore size="18px" /></button
>

<Popover anchor={button} direction="rtl" bind:visible>
	<div class="container">
		{@render children()}
	</div>
</Popover>

<style lang="scss">
	@use '../../styles/mixins/overlay';

	@include overlay.popover-container;

	button.icon {
		padding: 0;
	}
</style>
