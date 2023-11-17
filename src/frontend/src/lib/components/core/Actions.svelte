<script lang="ts">
	import Popover from '$lib/components/ui/Popover.svelte';
	import IconMore from '$lib/components/icons/IconMore.svelte';

	export let visible: boolean | undefined;

	let button: HTMLButtonElement | undefined;
</script>

<button class="square" bind:this={button} on:click={() => (visible = true)}><IconMore /></button>

<Popover bind:visible anchor={button} direction="rtl">
	<div class="container">
		<slot />
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
