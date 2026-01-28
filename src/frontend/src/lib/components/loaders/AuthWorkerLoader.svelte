<script lang="ts">
	import { onDestroy, onMount, type Snippet } from 'svelte';
	import { AuthWorker } from '$lib/services/workers/worker.auth.services';
	import { authStore } from '$lib/stores/auth.store';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();

	let worker = $state<AuthWorker | undefined>(undefined);

	onMount(async () => (worker = await AuthWorker.init()));
	onDestroy(() => worker?.terminate());

	$effect(() => {
		worker;
		$authStore;

		worker?.syncAuthIdle($authStore);
	});
</script>

{@render children()}
