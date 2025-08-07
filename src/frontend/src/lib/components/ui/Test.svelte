<script lang="ts">
    import type {TestId} from "$lib/types/test-id";
    import type { Snippet } from 'svelte';
	import {testId} from "$lib/utils/test.utils";

	interface Props {
		testId: TestId;
		children: Snippet;
	}

	let { testId: testIdProp, children }: Props = $props();

	let dataTid = $derived(testId(testIdProp));
</script>

<span data-tid={dataTid}>
	{@render children()}
</span>

<style lang="scss">
	span {
		display: contents;
	}
</style>
