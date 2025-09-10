<script lang="ts">
	import IconSearch from '$lib/components/icons/IconSearch.svelte';
	import ButtonIcon from '$lib/components/ui/ButtonIcon.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import { emit } from '$lib/utils/events.utils';

	const onclick = () => emit({ message: 'junoSpotlight' });
</script>

<ButtonIcon {onclick}>
	{#snippet icon()}
		<IconSearch size="16px" />
	{/snippet}

	{$i18n.spotlight.search_title}
</ButtonIcon>
