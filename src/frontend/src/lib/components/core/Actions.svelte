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

<button
	class="square"
	bind:this={button}
	onclick={() => (visible = true)}
	aria-label={$i18n.core.more}><IconMore /></button
>

<Popover bind:visible anchor={button} direction="rtl">
	<div class="container">
		{@render children()}
	</div>
</Popover>

<style lang="scss">
	@use '../../styles/mixins/overlay';

	@include overlay.popover-container;

	button {
		position: absolute;
		top: var(--padding-2x);
		right: var(--padding-2x);
	}
</style>
