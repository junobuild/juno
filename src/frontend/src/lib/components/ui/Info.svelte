<script lang="ts">
	import type { Snippet } from 'svelte';
	import IconInfo from '$lib/components/icons/IconInfo.svelte';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();
</script>

<p><span class="icon"><IconInfo size="32px" /></span> <span>{@render children()}</span></p>

<style lang="scss">
	@use '../../styles/mixins/info';

	p {
		@include info.info;
	}

	.icon {
		display: inline-flex;
		width: 32px;
	}
</style>
