<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import { onMount, type Snippet } from 'svelte';
	import { authStore } from '$lib/stores/auth.store';
	import { loadSettings } from '$lib/services/mission-control.services';

	interface Props {
		missionControlId: Principal;
		children: Snippet;
	}

	let { missionControlId, children }: Props = $props();

	onMount(() => {
		loadSettings({
			missionControlId,
			identity: $authStore.identity
		});
	});
</script>

{@render children()}
