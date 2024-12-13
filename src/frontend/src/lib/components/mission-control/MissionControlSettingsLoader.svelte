<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import { onMount, type Snippet } from 'svelte';
	import { loadSettings } from '$lib/services/mission-control.services';
	import { authStore } from '$lib/stores/auth.store';

	interface Props {
		missionControlId: Principal;
		children: Snippet;
	}

	let { missionControlId, children }: Props = $props();

	const load = async (reload?: boolean) => {
		await loadSettings({
			missionControlId,
			identity: $authStore.identity,
			reload
		});
	};

	onMount(() => {
		load();
	});
</script>

<svelte:window onjunoReloadSettings={async () => await load(true)} />

{@render children()}
