<script lang="ts">
	import IconJuno from '$lib/components/icons/IconJuno.svelte';
	import { i18n } from '$lib/stores/i18n.store';

	export let color: 'lavender' | 'white' = 'lavender';
</script>

<a href="/src/frontend/static" aria-label={$i18n.core.home}><IconJuno {color} /></a>

<style lang="scss">
	a {
		display: inline-flex;
	}
</style>
