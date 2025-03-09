<script lang="ts">
	import type { Snippet } from 'svelte';
	import Spinner from '$lib/components/ui/Spinner.svelte';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();
</script>

<p class="label loading"><Spinner inline /> <span>{@render children()}</span></p>

<style lang="scss">
	@use '../../styles/mixins/text';

	.loading {
		display: flex;
		gap: var(--padding);
		align-items: center;
		--spinner-size: 1rem;
	}

	p {
		margin: var(--spinner-paragraph-margin, var(--padding-3x) 0 0);
		color: var(--value-color);
	}

	span {
		font-size: var(--font-size-small);
		animation: pulse 1s linear infinite;

		@include text.truncate;
	}

	/* -global- */
	@keyframes -global-pulse {
		0% {
			opacity: 1;
		}

		50% {
			opacity: 0.75;
		}

		100% {
			opacity: 1;
		}
	}
</style>
