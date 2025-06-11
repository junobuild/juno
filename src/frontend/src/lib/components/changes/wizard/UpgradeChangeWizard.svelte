<script lang="ts">
	import { isNullish } from '@dfinity/utils';
	import type { Asset } from '@junobuild/storage';
	import { onMount } from 'svelte';
	import type { Satellite } from '$declarations/mission_control/mission_control.did';
	import { findWasmAssetForProposal } from '$lib/services/proposals/proposals.cdn.services';
	import { authStore } from '$lib/stores/auth.store';
	import type { ProposalRecord } from '$lib/types/proposals';
	import UpgradeCdnWizard from "$lib/components/cdn/wizard/UpgradeCdnWizard.svelte";

	interface Props {
		satellite: Satellite;
		proposal: ProposalRecord;
		onclose: () => void;
	}

	let { onclose, satellite, proposal }: Props = $props();

	let satelliteId = $derived(satellite.satellite_id.toText());

	let asset = $state<Asset | undefined>(undefined);

	const loadAsset = async () => {
		const result = await findWasmAssetForProposal({
			satelliteId,
			proposal,
			identity: $authStore.identity
		});

		if (isNullish(result)) {
			onclose();
			return;
		}

		asset = result;
	};

	onMount(loadAsset);
</script>

<UpgradeCdnWizard {satellite} {asset} {onclose} />