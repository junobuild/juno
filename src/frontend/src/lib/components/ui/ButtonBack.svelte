<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import type { NavigationTarget } from '@sveltejs/kit';
	import { afterNavigate } from '$app/navigation';
	import IconBack from '$lib/components/icons/IconBack.svelte';
	import ButtonIcon from '$lib/components/ui/ButtonIcon.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import { back } from '$lib/utils/nav.utils';

	let fromRoute: NavigationTarget | null;

	afterNavigate(({ from }) => {
		fromRoute = from;
	});
</script>

<ButtonIcon on:click={async () => await back({ pop: nonNullish(fromRoute) })}>
	<IconBack slot="icon" size="28px" />
	{$i18n.core.back}
</ButtonIcon>
