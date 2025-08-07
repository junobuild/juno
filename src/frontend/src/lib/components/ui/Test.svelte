<script lang="ts">
    import type {TestId} from "$lib/types/test-id";
    import type { Snippet } from 'svelte';
    import { isDev, isNotSkylab } from '$lib/env/app.env';

	interface Props {
		testId: TestId;
		children: Snippet;
	}

	let { testId, children }: Props = $props();

	let dev = isDev() && isNotSkylab();

	let dataTid = $derived(dev ? testId : undefined);
</script>

<span data-tid={dataTid}>
	{@render children()}
</span>

<style lang="scss">
	span {
		display: contents;
	}
</style>
