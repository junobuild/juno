<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import type { NavigationTarget } from '@sveltejs/kit';
	import { afterNavigate } from '$app/navigation';
	import IconBack from '$lib/components/icons/IconBack.svelte';
	import ButtonIcon from '$lib/components/ui/ButtonIcon.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import { back } from '$lib/utils/nav.utils';

	let fromRoute: NavigationTarget | null = $state(null);

	afterNavigate(({ from }) => {
		fromRoute = from;
	});
</script>

<ButtonIcon onclick={async () => await back({ pop: nonNullish(fromRoute) })}>
	{#snippet icon()}
		<IconBack size="16px" />
	{/snippet}
	{$i18n.core.back}
</ButtonIcon>
