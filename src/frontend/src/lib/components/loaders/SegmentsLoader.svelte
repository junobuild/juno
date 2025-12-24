<script lang="ts">
	import type { Principal } from '@icp-sdk/core/principal';
	import type { Snippet } from 'svelte';
	import { missionControlId } from '$lib/derived/console/account.mission-control.derived';
	import { loadSegments } from '$lib/services/segments.services';
	import type { Option } from '$lib/types/utils';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();

	const load = async (missionControlId: Option<Principal>) => {
		await loadSegments({ missionControlId });
	};

	$effect(() => {
		load($missionControlId);
	});
</script>

{@render children()}
