<script lang="ts">
	import { onMount } from 'svelte';
	import { applyColor } from '$lib/utils/theme.utils';
	import { Color } from '$lib/types/theme';
	import { layoutTitle } from '$lib/stores/layout.store';
	import { i18n } from '$lib/stores/i18n.store';
	import IconHosting from '$lib/components/icons/IconHosting.svelte';

	onMount(() => {
		layoutTitle.set({
			title: $i18n.hosting.title,
			icon: IconHosting
		});
		applyColor(Color.BABY_PINK);
	});
</script>

<slot />
