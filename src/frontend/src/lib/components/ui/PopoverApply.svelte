<script lang="ts">
	import { i18n } from '$lib/stores/i18n.store';
	import Popover from '$lib/components/ui/Popover.svelte';

	export let ariaLabel: string;
	export let visible: boolean | undefined;
	export let direction: 'ltr' | 'rtl' = 'rtl';

	let button: HTMLButtonElement | undefined;
</script>

<button
	class="icon"
	aria-label={ariaLabel}
	type="button"
	on:click={() => (visible = true)}
	bind:this={button}><slot name="icon" /></button
>

<Popover bind:visible anchor={button} {direction}>
	<div class="container">
		<slot />

		<button class="apply" type="button" on:click|stopPropagation>
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
