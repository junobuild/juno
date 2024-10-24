<script lang="ts">
	import { createBubbler, stopPropagation } from 'svelte/legacy';

	const bubble = createBubbler();
	import Popover from '$lib/components/ui/Popover.svelte';
	import { i18n } from '$lib/stores/i18n.store';

	interface Props {
		ariaLabel: string;
		visible: boolean | undefined;
		direction?: 'ltr' | 'rtl';
		icon?: import('svelte').Snippet;
		children?: import('svelte').Snippet;
	}

	let { ariaLabel, visible = $bindable(), direction = 'rtl', icon, children }: Props = $props();

	let button: HTMLButtonElement | undefined = $state();
</script>

<button
	class="icon"
	aria-label={ariaLabel}
	type="button"
	onclick={() => (visible = true)}
	bind:this={button}>{@render icon?.()}</button
>

<Popover bind:visible anchor={button} {direction}>
	<div class="container">
		{@render children?.()}

		<button class="apply" type="button" onclick={stopPropagation(bubble('click'))}>
			{$i18n.core.apply}
		</button>
	</div>
</Popover>

<style lang="scss">
	button.icon {
		padding: 0;
	}

	.container {
		display: flex;
		flex-direction: column;

		width: 100%;

		padding: var(--padding);
	}

	.apply {
		margin: var(--padding-1_5x) 0 var(--padding);
	}
</style>
