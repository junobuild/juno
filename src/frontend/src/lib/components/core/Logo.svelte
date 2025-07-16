<script lang="ts">
	import { blur } from 'svelte/transition';
	import IconJuno from '$lib/components/icons/IconJuno.svelte';
	import IconJunoLogo from '$lib/components/icons/IconJunoLogo.svelte';
	import { i18n } from '$lib/stores/i18n.store';

	interface Props {
		color?: 'lavender' | 'white';
		variant?: 'text' | 'icon';
	}

	let { color = 'lavender', variant = 'text' }: Props = $props();
</script>

<a href="/" aria-label={$i18n.core.home}>
	{#if variant === 'text'}
		<span in:blur>
			<IconJuno {color} />
		</span>
	{:else}
		<span in:blur>
			<IconJunoLogo {color} />
		</span>
	{/if}
</a>

<style lang="scss">
	a {
		display: inline-flex;
	}
</style>
