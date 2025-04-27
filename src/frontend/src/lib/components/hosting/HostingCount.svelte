<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import { compare } from 'semver';
	import { untrack } from 'svelte';
	import { fade } from 'svelte/transition';
	import type { Satellite } from '$declarations/mission_control/mission_control.did';
	import { countCollectionAssets } from '$lib/api/satellites.api';
	import { SATELLITE_v0_0_20 } from '$lib/constants/version.constants';
	import { authStore } from '$lib/stores/auth.store';
	import { i18n } from '$lib/stores/i18n.store';
	import { toasts } from '$lib/stores/toasts.store';
	import { versionStore } from '$lib/stores/version.store';

	interface Props {
		satellite: Satellite;
	}

	let { satellite }: Props = $props();

	let assets = $state(0n);

	const load = async () => {
		try {
			const version = $versionStore?.satellites[satellite.satellite_id.toText()]?.current;

			if (nonNullish(version) && compare(version, SATELLITE_v0_0_20) < 0) {
				// For simplicity reasons we do not display the information for not up-to-date Satellite.
				// In Satellite v0.0.20, the endpoint to list the number of assets in a collection was renamed from `count_assets` to `count_collection_assets`.
				return;
			}

			assets = await countCollectionAssets({
				satelliteId: satellite.satellite_id,
				collection: '#dapp',
				identity: $authStore.identity
			});
		} catch (err: unknown) {
			toasts.error({
				text: $i18n.errors.hosting_count_assets,
				detail: err
			});
		}
	};

	$effect(() => {
		$versionStore;

		untrack(() => {
			load();
		});
	});
</script>

{#if assets > 0}
	<p in:fade><small>{assets} {$i18n.hosting.files_deployed}</small></p>
{/if}

<style lang="scss">
	p {
		padding: 0 var(--padding) 0 0;
	}

	small {
		font-size: var(--font-size-very-small);
	}
</style>
