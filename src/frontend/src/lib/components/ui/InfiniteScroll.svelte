<script lang="ts">
	import { afterUpdate, beforeUpdate, createEventDispatcher, onDestroy } from 'svelte';
	import { isNullish } from '@dfinity/utils';

	/**
	 * Source: @dfinity/gix-components
	 */

	export let disabled = false;

	// IntersectionObserverInit is not recognized by the linter
	// eslint-disable-next-line no-undef
	export let options: IntersectionObserverInit = {
		rootMargin: '300px',
		threshold: 0
	};

	let container: HTMLDivElement | undefined;

	const dispatch = createEventDispatcher();

	const onIntersection = (entries: IntersectionObserverEntry[], observer: IntersectionObserver) => {
		const intersecting: IntersectionObserverEntry | undefined = entries.find(
			({ isIntersecting }: IntersectionObserverEntry) => isIntersecting
		);

		if (isNullish(intersecting)) {
			return;
		}

		// We can disconnect the observer. We have detected an intersection and consumer is going to fetch new elements.
		observer.disconnect();

		dispatch('junoIntersect');
	};

	const observer: IntersectionObserver = new IntersectionObserver(onIntersection, options);

	// Svelte workaround: beforeUpdate is called twice when bindings are used -> https://github.com/sveltejs/svelte/issues/6016
	let skipContainerNextUpdate = false;

	// We disconnect previous observer before any update. We do want to trigger an intersection in case of layout shifting.
	beforeUpdate(() => {
		if (!skipContainerNextUpdate) {
			observer.disconnect();
		}

		skipContainerNextUpdate = isNullish(container);
	});

	afterUpdate(() => {
		// The DOM has been updated. We reset the observer to the current last HTML element of the infinite list.

		// If not children, no element to observe
		if (isNullish(container) || isNullish(container.lastElementChild)) {
			return;
		}

		// If the infinite scroll is disabled, no observation should happen
		if (disabled) {
			return;
		}

		observer.observe(container.lastElementChild);
	});

	onDestroy(() => observer.disconnect());
</script>

<div bind:this={container}>
	<slot />
</div>

<style lang="scss">
	div {
		display: contents;
	}
</style>
