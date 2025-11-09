<script lang="ts">
	import type { Snippet } from 'svelte';
	import Popover from '$lib/components/ui/Popover.svelte';
	import { i18n } from '$lib/stores/i18n.store';

	interface Props {
		ariaLabel: string;
		visible: boolean | undefined;
		direction?: 'ltr' | 'rtl';
		icon?: Snippet;
		children: Snippet;
		onapply: () => Promise<void>;
	}

	let {
		ariaLabel,
		visible = $bindable(),
		direction = 'rtl',
		icon,
		children,
		onapply
	}: Props = $props();

	let button: HTMLButtonElement | undefined = $state();

	const apply = async ($event: MouseEvent | TouchEvent) => {
		$event.stopPropagation();

		await onapply();
	};
</script>

<button
	bind:this={button}
	class="icon"
	aria-label={ariaLabel}
	onclick={() => (visible = true)}
	type="button">{@render icon?.()}</button
>

<Popover anchor={button} {direction} bind:visible>
	<div class="container">
		{@render children()}

		<button class="apply" onclick={apply} type="button">
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
