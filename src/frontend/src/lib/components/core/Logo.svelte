<script lang="ts">
	import IconJuno from '$lib/components/icons/IconJuno.svelte';
	import { i18n } from '$lib/stores/i18n.store';

	interface Props {
		color?: 'lavender' | 'white';
	}

	let { color = 'lavender' }: Props = $props();
</script>

<a href="/" aria-label={$i18n.core.home}><IconJuno {color} /></a>

<style lang="scss">
	a {
		display: inline-flex;
	}
</style>
