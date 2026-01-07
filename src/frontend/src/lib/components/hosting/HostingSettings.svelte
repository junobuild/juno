<script lang="ts">
	import { fromNullable, isNullish, nonNullish } from '@dfinity/utils';
	import { onMount, untrack } from 'svelte';
	import { fade } from 'svelte/transition';
	import type { SatelliteDid } from '$declarations';
	import HostingSwitchMemory from '$lib/components/hosting/HostingSwitchMemory.svelte';
	import SkeletonText from '$lib/components/ui/SkeletonText.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { authIdentity } from '$lib/derived/auth.derived';
	import { getRuleDapp } from '$lib/services/satellite/collection.services';
	import { i18n } from '$lib/stores/app/i18n.store';
	import { versionStore } from '$lib/stores/version.store';
	import type { Satellite } from '$lib/types/satellite';

	interface Props {
		satellite: Satellite;
	}

	let { satellite }: Props = $props();

	let satelliteId = $derived(satellite.satellite_id);

	let rule = $state<SatelliteDid.Rule | undefined>(undefined);
	let supportSettings = $state(false);
	let loading = $state(true);

	let memory = $derived(fromNullable(rule?.memory ?? []));

	const loadRule = async () => {
		if (isNullish($authIdentity) || $versionStore?.satellites[satelliteId.toText()] === undefined) {
			return;
		}

		const result = await getRuleDapp({ satelliteId, identity: $authIdentity });
		rule = result?.rule;
		supportSettings = result?.result === 'success';

		loading = false;
	};

	$effect(() => {
		$authIdentity;
		$versionStore;

		untrack(loadRule);
	});
</script>

<div class="card-container with-title">
	<span class="title">{$i18n.core.settings}</span>

	<div class="columns-3 fit-column-1">
		<div>
			<Value>
				{#snippet label()}
					{$i18n.hosting.hosting_memory}
				{/snippet}

				{#if loading}
					<p><SkeletonText /></p>
				{:else if supportSettings && nonNullish(memory)}
					<p in:fade>{'Stable' in memory ? $i18n.collections.stable : $i18n.collections.heap}</p>
				{:else}
					<p in:fade>{$i18n.collections.heap}</p>
				{/if}
			</Value>
		</div>
	</div>
</div>

{#if supportSettings}
	<HostingSwitchMemory {memory} reload={loadRule} {satellite} />
{/if}
