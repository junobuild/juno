<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import { missionControlStore } from '$lib/stores/mission-control.store';
	import { i18nFormat } from '$lib/utils/i18n.utils';
	import { i18n } from '$lib/stores/i18n.store';
	import CanisterUpgradeModal from '$lib/components/modals/CanisterUpgradeModal.svelte';
	import type { JunoModalDetail, JunoModalUpgradeDetail } from '$lib/types/modal';
	import { upgradeMissionControl } from '@junobuild/admin';
	import { authStore } from '$lib/stores/auth.store';
	import { AnonymousIdentity } from '@dfinity/agent';
	import { container } from '$lib/utils/juno.utils';

	export let detail: JunoModalDetail;

	let newerReleases: string[];
	let currentVersion: string;

	$: ({ newerReleases, currentVersion } = detail as JunoModalUpgradeDetail);

	const upgradeMissionControlWasm = async ({ wasm_module }: { wasm_module: Uint8Array }) =>
		upgradeMissionControl({
			missionControl: {
				missionControlId: $missionControlStore!.toText(),
				identity: $authStore.identity ?? new AnonymousIdentity(),
				...container()
			},
			wasm_module
		});
</script>

{#if nonNullish($missionControlStore)}
	<CanisterUpgradeModal
		on:junoClose
		{newerReleases}
		{currentVersion}
		upgrade={upgradeMissionControlWasm}
		segment="mission_control"
	>
		<h2 slot="intro">
			{@html i18nFormat($i18n.canisters.upgrade_title, [
				{
					placeholder: '{0}',
					value: 'mission control center'
				}
			])}
		</h2>
	</CanisterUpgradeModal>
{/if}
