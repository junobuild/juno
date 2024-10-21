<script lang="ts">
	import IconMore from '$lib/components/icons/IconMore.svelte';
	import Popover from '$lib/components/ui/Popover.svelte';
	import { i18n } from '$lib/stores/i18n.store';

	export let visible: boolean | undefined = undefined;

	let button: HTMLButtonElement | undefined;
</script>

<button
	class="square"
	bind:this={button}
	on:click={() => (visible = true)}
	aria-label={$i18n.core.more}><IconMore /></button
>

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
