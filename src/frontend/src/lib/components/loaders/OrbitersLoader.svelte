<script lang="ts">
	import type { Principal } from '@icp-sdk/core/principal';
	import type { Snippet } from 'svelte';
	import { missionControlId } from '$lib/derived/console/account.mission-control.derived';
	import { loadOrbiters } from '$lib/services/mission-control/mission-control.orbiters.services';
	import type { Option } from '$lib/types/utils';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();

	const load = async (missionControlId: Option<Principal>) => {
		await loadOrbiters({ missionControlId });
	};

	$effect(() => {
		load($missionControlId);
	});
</script>

{@render children()}
