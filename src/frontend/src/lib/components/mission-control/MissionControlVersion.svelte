<script lang="ts">
	import { isNullish } from '@dfinity/utils';
	import { type Snippet, untrack } from 'svelte';
	import { missionControlIdDerived } from '$lib/derived/mission-control.derived';
	import { loadMissionControlVersion } from '$lib/services/version/version.mission-control.services';
	import { authStore } from '$lib/stores/auth.store';

	interface Props {
		children?: Snippet;
	}

	let { children }: Props = $props();

	const load = async () => {
		if (isNullish($missionControlIdDerived)) {
			return;
		}

		await loadMissionControlVersion({
			missionControlId: $missionControlIdDerived,
			skipReload: true,
			identity: $authStore.identity
		});
	};

	$effect(() => {
		$missionControlIdDerived;

		untrack(load);
	});
</script>

{@render children?.()}
