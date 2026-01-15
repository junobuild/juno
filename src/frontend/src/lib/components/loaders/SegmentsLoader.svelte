<script lang="ts">
	import type { Snippet } from 'svelte';
	import { missionControlCertifiedId } from '$lib/derived/console/account.mission-control.derived';
	import { loadSegments } from '$lib/services/segments.services';
	import type { MissionControlCertifiedId } from '$lib/types/mission-control';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();

	const load = async (missionControlCertifiedId: MissionControlCertifiedId) => {
		// Not yet loaded
		if (missionControlCertifiedId === undefined) {
			return;
		}

		const { data: missionControlId, certified } = missionControlCertifiedId;

		// TODO(#767): load segments with query+update
		// For now skips certified account to avoid duplicate load at boot time.
		if (certified) {
			return;
		}

		await loadSegments({ missionControlId });
	};

	$effect(() => {
		load($missionControlCertifiedId);
	});
</script>

{@render children()}
