<script lang="ts">
	import type { Snippet } from 'svelte';
	import Popover from '$lib/components/ui/Popover.svelte';
	import { i18n } from '$lib/stores/app/i18n.store';

	interface Props {
		visible?: boolean | undefined;
		direction?: 'ltr' | 'rtl';
		children: Snippet;
		icon: Snippet;
	}

	let { visible = $bindable(false), direction, children, icon }: Props = $props();

	let button: HTMLButtonElement | undefined = $state();
</script>

<button bind:this={button} aria-label={$i18n.core.more} onclick={() => (visible = true)}
	>{@render icon()}</button
>

<Popover anchor={button} {direction} bind:visible>
	<div class="container">
		{@render children()}
	</div>
</Popover>

<style lang="scss">
	@use '../../styles/mixins/overlay';

	@include overlay.popover-container;
</style>
