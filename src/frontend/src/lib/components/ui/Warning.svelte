<script lang="ts">
	import type { Snippet } from 'svelte';
	import IconWarning from '$lib/components/icons/IconWarning.svelte';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();
</script>

<div><span><IconWarning /></span> {@render children()}</div>

<style lang="scss">
	@use '../../styles/mixins/info';

	div {
		@include info.warning;
	}

	span {
		align-self: var(--warning-icon-align-self);
	}
</style>
