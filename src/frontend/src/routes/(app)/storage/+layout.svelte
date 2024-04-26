<script lang="ts">
	import { onMount } from 'svelte';
	import { applyColor } from '$lib/utils/theme.utils';
	import { Color } from '$lib/types/theme';
	import { layoutTitle } from '$lib/stores/layout.store';
	import { i18n } from '$lib/stores/i18n.store';
	import IconStorage from '$lib/components/icons/IconStorage.svelte';

	onMount(() => {
		layoutTitle.set({
			title: $i18n.storage.title,
			icon: IconStorage
		});
		applyColor(Color.PINK_LACE);
	});
</script>

<slot />
