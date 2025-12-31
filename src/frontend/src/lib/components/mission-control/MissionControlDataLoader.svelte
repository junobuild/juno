<script lang="ts">
	import { isNullish } from '@dfinity/utils';
	import { onMount, type Snippet, untrack } from 'svelte';
	import { authIdentity } from '$lib/derived/auth.derived';
	import { missionControlVersion } from '$lib/derived/version.derived';
	import {
		loadSettings,
		loadUserData
	} from '$lib/services/mission-control/mission-control.services';
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
				identity: $authIdentity,
				reload
			}),
			loadUserData({
				missionControlId,
				identity: $authIdentity,
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
