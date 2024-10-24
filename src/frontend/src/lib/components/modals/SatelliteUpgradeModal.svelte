<script lang="ts">
	import { run } from 'svelte/legacy';

	import { AnonymousIdentity } from '@dfinity/agent';
	import { type BuildType, upgradeSatellite } from '@junobuild/admin';
	import { compare } from 'semver';
	import type { Satellite } from '$declarations/mission_control/mission_control.did';
	import CanisterUpgradeModal from '$lib/components/modals/CanisterUpgradeModal.svelte';
	import Html from '$lib/components/ui/Html.svelte';
	import { authStore } from '$lib/stores/auth.store';
	import { i18n } from '$lib/stores/i18n.store';
	import type { JunoModalDetail, JunoModalUpgradeSatelliteDetail } from '$lib/types/modal';
	import { i18nFormat } from '$lib/utils/i18n.utils';
	import { container } from '$lib/utils/juno.utils';
	import { satelliteName } from '$lib/utils/satellite.utils';

	interface Props {
		detail: JunoModalDetail;
	}

	let { detail }: Props = $props();

	let satellite: Satellite = $state();
	let currentVersion: string = $state();
	let newerReleases: string[] = $state();
	let build: BuildType | undefined = $state();

	run(() => {
		({ satellite, currentVersion, newerReleases, build } =
			detail as JunoModalUpgradeSatelliteDetail);
	});

	const upgradeSatelliteWasm = async ({ wasm_module }: { wasm_module: Uint8Array }) =>
		await upgradeSatellite({
			satellite: {
				satelliteId: satellite.satellite_id.toText(),
				identity: $authStore.identity ?? new AnonymousIdentity(),
				...container()
			},
			wasm_module,
			// TODO: option to be removed
			deprecated: compare(currentVersion, '0.0.7') < 0,
			deprecatedNoScope: compare(currentVersion, '0.0.9') < 0
		});
</script>

<CanisterUpgradeModal
	on:junoClose
	{newerReleases}
	{currentVersion}
	{build}
	upgrade={upgradeSatelliteWasm}
	segment="satellite"
>
	{#snippet intro()}
		<h2>
			<Html
				text={i18nFormat($i18n.canisters.upgrade_title, [
					{
						placeholder: '{0}',
						value: satelliteName(satellite)
					}
				])}
			/>
		</h2>
	{/snippet}
</CanisterUpgradeModal>
