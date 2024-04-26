<script lang="ts">
	import IconJuno from '$lib/components/icons/IconJuno.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import { page } from '$app/stores';

	export let color: 'lavender' | 'white' = 'lavender';

	let routeId: string | null;
	$: routeId = $page.route.id;

	let home: boolean;
	$: home = routeId?.includes('(home)') === true;

	let href: string;
	$: href = home ? 'https://juno.build' : '/';

	let alt: string;
	$: alt = home ? $i18n.core.open_website : $i18n.core.home;

	let target: '_blank' | undefined;
	$: target = home ? '_blank' : undefined;
</script>

<a {href} aria-label={alt} rel="external noopener noreferrer" {target}><IconJuno {color} /></a>

<style lang="scss">
	a {
		display: inline-flex;
	}
</style>
