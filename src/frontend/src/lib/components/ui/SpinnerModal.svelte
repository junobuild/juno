<script lang="ts">
	import Spinner from '$lib/components/ui/Spinner.svelte';
	import { onDestroy, onMount } from 'svelte';
	import { confirmToCloseBrowser } from '$lib/utils/before-unload.utils';

	export let icon: 'satellite' | 'rocket' = 'rocket';

	onMount(() => confirmToCloseBrowser(true));
	onDestroy(() => confirmToCloseBrowser(false));
</script>

<div class="msg">
	<Spinner {icon} />

	<slot />
</div>

<style lang="scss">
	@use '../../styles/mixins/overlay';

	.msg {
		@include overlay.message;
	}
</style>
