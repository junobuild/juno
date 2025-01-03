<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import { isNullish } from '@dfinity/utils';
	import { compare } from 'semver';
	import { onMount, type Snippet, untrack } from 'svelte';
	import { MISSION_CONTROL_v0_0_13 } from '$lib/constants/version.constants';
	import { missionControlVersion } from '$lib/derived/version.derived';
	import { loadSettings, loadUserMetadata } from '$lib/services/mission-control.services';
	import { authStore } from '$lib/stores/auth.store';

	interface Props {
		missionControlId: Principal;
		children: Snippet;
	}

	let { missionControlId, children }: Props = $props();

	const load = async () => {
		if (isNullish($missionControlVersion?.current)) {
			return;
		}

		await Promise.all([
			loadSettings({
				missionControl: missionControlId,
				identity: $authStore.identity,
				missionControlVersion: $missionControlVersion
			}),
			loadUserMetadata({
				missionControl: missionControlId,
				identity: $authStore.identity,
				missionControlVersion: $missionControlVersion
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

{@render children()}
