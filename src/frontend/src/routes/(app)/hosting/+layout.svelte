<script lang="ts">
	import { onMount } from 'svelte';
	import IconHosting from '$lib/components/icons/IconHosting.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import { layoutTitle } from '$lib/stores/layout.store';
	import { Color } from '$lib/types/theme';
	import { applyColor } from '$lib/utils/theme.utils';

	onMount(() => {
		layoutTitle.set({
			title: $i18n.hosting.title,
			icon: IconHosting
		});
		applyColor(Color.BABY_PINK);
	});
</script>

<slot />
