<script lang="ts">
	import type { Snippet } from 'svelte';
	import { fade } from 'svelte/transition';
	import { i18n } from '$lib/stores/app/i18n.store';
	import type { TestId } from '$lib/types/test-id';
	import { testId } from '$lib/utils/test.utils';

	interface Props {
		children: Snippet;
		navigate: () => Promise<void>;
		onclose: () => void;
		testId?: TestId;
	}

	let { children, navigate, onclose, testId: testIdProp }: Props = $props();

	let animateNav = $state(false);

	const onclick = async () => {
		animateNav = true;

		try {
			await navigate();

			onclose();
		} finally {
			animateNav = false;
		}
	};
</script>

<div class="msg">
	{#if animateNav}
		<p in:fade>{$i18n.core.redirecting}</p>
	{:else}
		<p>{@render children()}</p>

		<button {...testId(testIdProp)} disabled={animateNav} {onclick}>
			{$i18n.core.continue}
		</button>
	{/if}
</div>

<style lang="scss">
	@use '../../../../styles/mixins/overlay';

	.msg {
		@include overlay.message;

		p {
			margin: var(--padding-8x) 0 0;
		}
	}
</style>
