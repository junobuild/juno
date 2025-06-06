<script lang="ts">
	import type { Snippet } from 'svelte';
	import IconInfo from '$lib/components/icons/IconInfo.svelte';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();
</script>

<p><IconInfo size="32px" /> {@render children()}</p>

<style lang="scss">
	@use '../../styles/mixins/info';

	p {
		@include info.info;
	}
</style>
