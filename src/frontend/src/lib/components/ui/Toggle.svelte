<script lang="ts">
	import type { Snippet } from 'svelte';
	import IconLightOff from '$lib/components/icons/IconLightOff.svelte';
	import IconLightOn from '$lib/components/icons/IconLightOn.svelte';

	interface Props {
		children: Snippet;
		enabled: boolean;
		onclick: () => void;
		nomargin?: boolean;
	}

	let { children, onclick, enabled, nomargin = false }: Props = $props();

	let Icon = $derived(enabled ? IconLightOn : IconLightOff);
</script>

<button class="text" class:nomargin {onclick}>
	<Icon size="20px" />
	<span>{@render children()}</span>
</button>

<style lang="scss">
	@use '../../styles/mixins/media';

	.text {
		display: inline-flex;
		justify-content: flex-start;

		gap: var(--padding);

		text-decoration: none;

		margin: 0 0 var(--padding-2_5x);
		border: none;

		&.nomargin {
			margin: 0;
		}

		&:active {
			transform: none;
		}
	}

	span {
		margin: 0;
	}
</style>
