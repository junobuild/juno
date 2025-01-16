<script lang="ts">
	import { isNullish } from '@dfinity/utils';
	import { onDestroy, type Snippet } from 'svelte';

	interface Props {
		onintersect: () => void;
		disabled?: boolean;
		// IntersectionObserverInit is not recognized by the linter
		// eslint-disable-next-line no-undef
		options?: IntersectionObserverInit;
		children: Snippet;
	}

	let {
		onintersect,
		disabled = false,
		options = {
			rootMargin: '300px',
			threshold: 0
		},
		children
	}: Props = $props();

	let target: HTMLDivElement | undefined;

	// eslint-disable-next-line local-rules/prefer-object-params
	const onIntersection = (entries: IntersectionObserverEntry[]) => {
		const intersecting = entries.find(
			({ isIntersecting }: IntersectionObserverEntry) => isIntersecting
		);

		if (isNullish(intersecting)) {
			return;
		}

		onintersect();
	};

	const observer: IntersectionObserver = new IntersectionObserver(onIntersection, options);

	// Svelte workaround: beforeUpdate is called twice when bindings are used -> https://github.com/sveltejs/svelte/issues/6016
	let skipContainerNextUpdate = false;

	// We disconnect previous observer before any update. We do want to trigger an intersection in case of layout shifting.
	$effect.pre(() => {
		if (!skipContainerNextUpdate) {
			observer.disconnect();
		}

		skipContainerNextUpdate = isNullish(target);
	});

	$effect(() => {
		// The DOM has been updated. We reset the observer to the current last HTML element of the infinite list.

		// If no element to observe
		if (isNullish(target)) {
			return;
		}

		// If the infinite scroll is disabled, no observation should happen
		if (disabled) {
			return;
		}

		observer.observe(target);
	});

	onDestroy(() => observer.disconnect());
</script>

{@render children()}

<div bind:this={target} class="intersection-observer-target"></div>

<style lang="scss">
	.intersection-observer-target {
		width: 0;
		height: 0;
		opacity: 0;
		visibility: hidden;
	}
</style>
