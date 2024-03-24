<script lang="ts">
	import { onMount } from 'svelte';
	import { applyColor } from '$lib/utils/theme.utils';
	import { Color } from '$lib/types/theme';
	import { layoutTitle } from '$lib/stores/layout.store';
	import { i18n } from '$lib/stores/i18n.store';

	onMount(() => {
		layoutTitle.set($i18n.functions.title);
		applyColor(Color.SHANDY);
	});
</script>

<slot />
