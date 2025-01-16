<script lang="ts">
	import { isNullish } from '@dfinity/utils';
	import { onMount, type Snippet, untrack } from 'svelte';
	import { missionControlVersion } from '$lib/derived/version.derived';
	import { loadSettings, loadUserData } from '$lib/services/mission-control.services';
	import { authStore } from '$lib/stores/auth.store';
	import type { MissionControlId } from '$lib/types/mission-control';

	interface Props {
		missionControlId: MissionControlId;
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
