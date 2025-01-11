<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import { isNullish } from '@dfinity/utils';
	import { onMount, type Snippet, untrack } from 'svelte';
	import { missionControlVersion } from '$lib/derived/version.derived';
	import { loadSettings, loadUserData } from '$lib/services/mission-control.services';
	import { authStore } from '$lib/stores/auth.store';

	interface Props {
		missionControlId: Principal;
		reload?: boolean;
		children?: Snippet;
	}

	let { missionControlId, children, reload = false }: Props = $props();

	const load = async () => {
		if (isNullish($missionControlVersion?.current)) {
			return;
		}

		await Promise.all([
			loadSettings({
				missionControlId,
				identity: $authStore.identity,
				reload
			}),
			loadUserData({
				missionControlId,
				identity: $authStore.identity,
				reload
			})
		]);
	};

	onMount(() => {
		load();
	});

	$effect(() => {
		$missionControlVersion;

		untrack(load);
	});
</script>

{@render children?.()}
