<script lang="ts">
	import { onDestroy, onMount, type Snippet } from 'svelte';
	import ProgressSteps from '$lib/components/ui/ProgressSteps.svelte';
	import type { ProgressStep } from '$lib/types/progress-step';
	import { confirmToCloseBrowser } from '$lib/utils/before-unload.utils';

	interface Props {
		children: Snippet;
		steps: [ProgressStep, ...ProgressStep[]];
	}

	let { children, steps }: Props = $props();

	onMount(() => confirmToCloseBrowser(true));
	onDestroy(() => confirmToCloseBrowser(false));
</script>

<h2>{@render children()}</h2>

<div>
	<ProgressSteps {steps} />
</div>

<style lang="scss">
	div {
		margin: var(--padding-4x) 0;
	}
</style>
