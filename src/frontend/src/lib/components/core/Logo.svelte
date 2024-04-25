<script lang="ts">
	import IconJuno from '$lib/components/icons/IconJuno.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import { authSignedInStore } from '$lib/stores/auth.store';

	export let color: 'lavender' | 'white' = 'lavender';

	let href: string;
	$: href = $authSignedInStore ? '/' : 'https://juno.build';

	let alt: string;
	$: alt = $authSignedInStore ? $i18n.core.home : $i18n.core.open_website;
</script>

<a {href} aria-label={alt} rel="external noopener noreferrer"><IconJuno {color} /></a>

<style lang="scss">
	a {
		display: inline-flex;
	}
</style>
