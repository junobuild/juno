<script lang="ts">
	import ButtonIcon from '$lib/components/ui/ButtonIcon.svelte';
	import { back } from '$lib/utils/nav.utils';
	import IconBack from '$lib/components/icons/IconBack.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import type { NavigationTarget } from '@sveltejs/kit';
	import { afterNavigate } from '$app/navigation';
	import { nonNullish } from '@dfinity/utils';

	let fromRoute: NavigationTarget | null;

	afterNavigate(({ from }) => {
		fromRoute = from;
	});
</script>

<ButtonIcon on:click={async () => await back({ pop: nonNullish(fromRoute) })}>
	<IconBack slot="icon" />
	{$i18n.core.back}
</ButtonIcon>
