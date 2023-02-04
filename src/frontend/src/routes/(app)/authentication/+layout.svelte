<script lang="ts">
	import { onMount } from 'svelte';
	import { applyColor } from '$lib/utils/theme.utils';
	import { Color } from '$lib/types/theme';
	import { layoutTitle } from '$lib/stores/layout.store';

	onMount(() => {
		layoutTitle.set('Authentication');
		applyColor(Color.PAPAYA_WHIP);
	});
</script>

<slot />
