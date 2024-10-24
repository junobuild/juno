<script lang="ts">
	import { onDestroy, onMount, type Snippet } from 'svelte';
	import Spinner from '$lib/components/ui/Spinner.svelte';
	import { confirmToCloseBrowser } from '$lib/utils/before-unload.utils';

	interface Props {
		children?: Snippet;
	}

	let { children }: Props = $props();

	onMount(() => confirmToCloseBrowser(true));
	onDestroy(() => confirmToCloseBrowser(false));
</script>

<div class="msg">
	<Spinner inline />
	{@render children?.()}
</div>

<style lang="scss">
	@use '../../styles/mixins/overlay';

	.msg {
		@include overlay.message;
	}
</style>
