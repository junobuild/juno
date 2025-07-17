<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import type { Snippet } from 'svelte';
	import type { Orbiter } from '$declarations/mission_control/mission_control.did';
	import { missionControlIdDerived } from '$lib/derived/mission-control.derived';
	import { orbiterStore } from '$lib/derived/orbiter.derived';
	import { loadOrbiters } from '$lib/services/orbiter/orbiters.services';
	import { reloadOrbiterVersion } from '$lib/services/version/version.orbiter.services';
	import { authStore } from '$lib/stores/auth.store';
	import type { Option } from '$lib/types/utils';

	interface Props {
		children: Snippet;
		withVersion?: boolean;
	}

	let { children, withVersion = false }: Props = $props();

	const load = async (missionControlId: Option<Principal>) => {
		await loadOrbiters({ missionControlId });
	};

	const loadVersion = async ({
		orbiter,
		skipReload
	}: {
		orbiter: Option<Orbiter>;
		skipReload: boolean;
	}) => {
		if (!withVersion) {
			return;
		}

		await reloadOrbiterVersion({
			orbiterId: orbiter?.orbiter_id,
			skipReload,
			identity: $authStore.identity
		});
	};

	$effect(() => {
		load($missionControlIdDerived);
	});

	$effect(() => {
		loadVersion({ orbiter: $orbiterStore, skipReload: true });
	});
</script>

{@render children()}
