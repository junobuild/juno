<script lang="ts">
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

	export let detail: JunoModalDetail;

	let satellite: Satellite;
	let currentVersion: string;
	let newerReleases: string[];
	let build: BuildType | undefined;

	$: ({ satellite, currentVersion, newerReleases, build } =
		detail as JunoModalUpgradeSatelliteDetail);

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
	<h2 slot="intro">
		<Html
			text={i18nFormat($i18n.canisters.upgrade_title, [
				{
					placeholder: '{0}',
					value: satelliteName(satellite)
				}
			])}
		/>
	</h2>
</CanisterUpgradeModal>
