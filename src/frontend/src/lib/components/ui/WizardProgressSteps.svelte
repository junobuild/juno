<script lang="ts">
	import ProgressSteps from '$lib/components/ui/ProgressSteps.svelte';
	import type { Snippet } from 'svelte';
	import type { ProgressStep } from '$lib/types/progress-step';

	interface Props {
		children: Snippet;
		steps: [ProgressStep, ...ProgressStep[]];
	}

	let { children, steps }: Props = $props();
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
