<script lang="ts">
	import { onMount } from 'svelte';
	import { layoutTitle } from '$lib/stores/layout.store';
	import { i18n } from '$lib/stores/i18n.store';
	import IconTelescope from '$lib/components/icons/IconTelescope.svelte';

	onMount(() =>
		layoutTitle.set({
			title: $i18n.observatory.title,
			icon: IconTelescope
		})
	);
</script>

<slot />
