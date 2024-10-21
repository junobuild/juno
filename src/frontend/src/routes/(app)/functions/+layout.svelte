<script lang="ts">
	import { onMount } from 'svelte';
	import IconFunctions from '$lib/components/icons/IconFunctions.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import { layoutTitle } from '$lib/stores/layout.store';
	import { Color } from '$lib/types/theme';
	import { applyColor } from '$lib/utils/theme.utils';

	onMount(() => {
		layoutTitle.set({
			title: $i18n.functions.title,
			icon: IconFunctions
		});
		applyColor(Color.SHANDY);
	});
</script>

<slot />
