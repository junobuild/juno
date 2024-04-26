<script lang="ts">
	import { onMount } from 'svelte';
	import { applyColor } from '$lib/utils/theme.utils';
	import { Color } from '$lib/types/theme';
	import { layoutTitle } from '$lib/stores/layout.store';
	import { i18n } from '$lib/stores/i18n.store';
	import IconFunctions from '$lib/components/icons/IconFunctions.svelte';

	onMount(() => {
		layoutTitle.set({
			title: $i18n.functions.title,
			icon: IconFunctions
		});
		applyColor(Color.SHANDY);
	});
</script>

<slot />
