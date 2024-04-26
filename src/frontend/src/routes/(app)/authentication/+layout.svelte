<script lang="ts">
	import { onMount } from 'svelte';
	import { applyColor } from '$lib/utils/theme.utils';
	import { Color } from '$lib/types/theme';
	import { layoutTitle } from '$lib/stores/layout.store';
	import { i18n } from '$lib/stores/i18n.store';
	import IconAuthentication from '$lib/components/icons/IconAuthentication.svelte';

	onMount(() => {
		layoutTitle.set({
			title: $i18n.authentication.title,
			icon: IconAuthentication
		});
		applyColor(Color.PAPAYA_WHIP);
	});
</script>

<slot />
