<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import type { Snippet } from 'svelte';
	import IconInfo from '$lib/components/icons/IconInfo.svelte';

	interface Props {
		children: Snippet;
		icon?: Snippet;
	}

	let { children, icon }: Props = $props();
</script>

<p>
	<span class="icon"
		>{#if nonNullish(icon)}{@render icon()}{:else}<IconInfo size="32px" />{/if}</span
	> <span>{@render children()}</span>
</p>

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
