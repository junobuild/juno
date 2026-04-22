<script lang="ts">
	import { type Snippet, untrack } from 'svelte';
	import { missionControlCertifiedId } from '$lib/derived/console/account.mission-control.derived';
	import { loadSegments } from '$lib/services/segments.services';
	import type { MissionControlCertifiedId } from '$lib/types/mission-control';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();

	let loading = $state(false);

	const load = async (missionControlCertifiedId: MissionControlCertifiedId) => {
		// Not yet loaded
		if (missionControlCertifiedId === undefined) {
			return;
		}

		// I dislike those kind of "loading guard" pattern but, I don't really see another way
		// for now to prevent loading twice the list of segments.
		// TODO(#767): in the future, remove the state and load segments with query+update
		// TODO: likewise in SatelliteConfigLoader
		if (loading) {
			return;
		}

		loading = true;

		const { data: missionControlId } = missionControlCertifiedId;

		await loadSegments({ missionControlId });

		loading = false;
	};

	$effect(() => {
		$missionControlCertifiedId;

		untrack(() => {
			load($missionControlCertifiedId);
		});
	});
</script>

{@render children()}
