<script lang="ts">
	import { onMount } from 'svelte';
	import { applyColor } from '$lib/utils/theme.utils';
	import { Color } from '$lib/types/theme';
	import { layoutTitle } from '$lib/stores/layout.store';
	import { i18n } from '$lib/stores/i18n.store';

	onMount(() => {
		layoutTitle.set($i18n.storage.title);
		applyColor(Color.PINK_LACE);
	});
</script>

<slot />
