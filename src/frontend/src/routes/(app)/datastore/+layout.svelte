<script lang="ts">
	import { onMount } from 'svelte';
	import { applyColor } from '$lib/utils/theme.utils';
	import { Color } from '$lib/types/theme';
	import { layoutTitle } from '$lib/stores/layout.store';
	import { i18n } from '$lib/stores/i18n.store';
	import IconDatastore from '$lib/components/icons/IconDatastore.svelte';

	onMount(() => {
		layoutTitle.set({
			title: $i18n.datastore.title,
			icon: IconDatastore
		});
		applyColor(Color.AERO_BLUE);
	});
</script>

<slot />
