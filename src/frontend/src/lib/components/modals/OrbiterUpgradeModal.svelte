<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import { i18nFormat } from '$lib/utils/i18n.utils';
	import { i18n } from '$lib/stores/i18n.store';
	import CanisterUpgradeModal from '$lib/components/modals/CanisterUpgradeModal.svelte';
	import type { JunoModalDetail, JunoModalUpgradeDetail } from '$lib/types/modal';
	import { authStore } from '$lib/stores/auth.store';
	import { AnonymousIdentity } from '@dfinity/agent';
	import { orbiterStore } from '$lib/stores/orbiter.store';
	import { upgradeOrbiter } from '@junobuild/admin';
	import {container} from "$lib/utils/juno.utils";

	export let detail: JunoModalDetail;

	let newerReleases: string[];
	let currentVersion: string;

	$: ({ newerReleases, currentVersion } = detail as JunoModalUpgradeDetail);

	const upgradeOrbiterWasm = async ({ wasm_module }: { wasm_module: Uint8Array }) =>
		upgradeOrbiter({
			orbiter: {
				orbiterId: $orbiterStore!.orbiter_id.toText(),
				identity: $authStore.identity ?? new AnonymousIdentity(),
				...container()
			},
			wasm_module
		});
</script>

{#if nonNullish($orbiterStore)}
	<CanisterUpgradeModal
		on:junoClose
		{newerReleases}
		{currentVersion}
		upgrade={upgradeOrbiterWasm}
		segment="orbiter"
	>
		<h2 slot="intro">
			{@html i18nFormat($i18n.canisters.upgrade_title, [
				{
					placeholder: '{0}',
					value: 'orbiter'
				}
			])}
		</h2>
	</CanisterUpgradeModal>
{/if}
