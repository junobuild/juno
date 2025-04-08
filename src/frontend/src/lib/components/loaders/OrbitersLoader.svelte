<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import type { Snippet } from 'svelte';
	import type { Orbiter } from '$declarations/mission_control/mission_control.did';
	import { missionControlIdDerived } from '$lib/derived/mission-control.derived';
	import { orbiterStore } from '$lib/derived/orbiter.derived';
	import { loadOrbiters } from '$lib/services/orbiters.services';
	import { loadOrbiterVersion } from '$lib/services/version.loader.services';
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
		reload
	}: {
		orbiter: Option<Orbiter>;
		reload: boolean;
	}) => {
		if (!withVersion) {
			return;
		}

		await loadOrbiterVersion({ orbiter, reload });
	};

	$effect(() => {
		load($missionControlIdDerived);
	});

	$effect(() => {
		loadVersion({ orbiter: $orbiterStore, reload: false });
	});
</script>

<svelte:window
	onjunoReloadVersions={async () => await loadVersion({ orbiter: $orbiterStore, reload: true })}
/>

{@render children()}
