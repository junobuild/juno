<script lang="ts">
	import { onMount } from 'svelte';
	import IconStorage from '$lib/components/icons/IconStorage.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import { layoutTitle } from '$lib/stores/layout.store';
	import { Color } from '$lib/types/theme';
	import { applyColor } from '$lib/utils/theme.utils';

	onMount(() => {
		layoutTitle.set({
			title: $i18n.storage.title,
			icon: IconStorage
		});
		applyColor(Color.PINK_LACE);
	});
</script>

<slot />
