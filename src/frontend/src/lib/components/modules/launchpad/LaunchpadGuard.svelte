<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import type { Snippet } from 'svelte';
	import { run } from 'svelte/legacy';
	import { fade } from 'svelte/transition';
	import Message from '$lib/components/ui/Message.svelte';
	import Spinner from '$lib/components/ui/Spinner.svelte';
	import { satellites } from '$lib/derived/satellites.derived';
	import { i18n } from '$lib/stores/app/i18n.store';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();

	let loading = $state(true);
	run(() => {
		(() => {
			if (nonNullish($satellites)) {
				setTimeout(() => (loading = false), 500);
				return;
			}

			loading = true;
		})();
	});
</script>

{#if loading}
	<div class="spinner">
		<Message>
			{#snippet icon()}
				<Spinner inline />
			{/snippet}

			<p>{$i18n.launchpad.loading_launchpad}</p>
		</Message>
	</div>
{:else if nonNullish($satellites)}
	<div in:fade>
		{@render children()}
	</div>
{/if}

<style lang="scss">
	.spinner {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -75%);
	}
</style>
