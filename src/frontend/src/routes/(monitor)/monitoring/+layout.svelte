<script lang="ts">
	import { onMount } from 'svelte';
	import IconTelescope from '$lib/components/icons/IconTelescope.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import { layoutTitle } from '$lib/stores/layout.store';

	onMount(() =>
		layoutTitle.set({
			title: $i18n.observatory.title,
			icon: IconTelescope
		})
	);
</script>

<slot />
