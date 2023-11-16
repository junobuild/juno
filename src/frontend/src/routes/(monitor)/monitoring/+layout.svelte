<script lang="ts">
	import { onMount } from 'svelte';
	import { layoutTitle } from '$lib/stores/layout.store';
	import { i18n } from '$lib/stores/i18n.store';

	onMount(() => layoutTitle.set($i18n.observatory.title));
</script>

<slot />
