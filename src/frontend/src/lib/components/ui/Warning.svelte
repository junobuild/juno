<script lang="ts">
	import type { Snippet } from 'svelte';
	import IconWarning from '$lib/components/icons/IconWarning.svelte';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();
</script>

<p><IconWarning /> {@render children()}</p>

<style lang="scss">
	@use '../../styles/mixins/info';

	p {
		@include info.warning;
	}
</style>
