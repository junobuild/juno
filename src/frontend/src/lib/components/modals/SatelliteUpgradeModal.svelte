<script lang="ts">
	import { AnonymousIdentity } from '@dfinity/agent';
	import { nonNullish } from '@dfinity/utils';
	import { type UpgradeCodeParams, upgradeSatellite } from '@junobuild/admin';
	import { compare } from 'semver';
	import CanisterUpgradeModal from '$lib/components/modals/CanisterUpgradeModal.svelte';
	import Html from '$lib/components/ui/Html.svelte';
	import { SATELLITE_v0_0_7, SATELLITE_v0_0_9 } from '$lib/constants/version.constants';
	import { missionControlIdDerived } from '$lib/derived/mission-control.derived';
	import { reloadSatelliteVersion } from '$lib/services/version/version.satellite.services';
	import { authStore } from '$lib/stores/auth.store';
	import { i18n } from '$lib/stores/i18n.store';
	import type { JunoModalDetail, JunoModalUpgradeSatelliteDetail } from '$lib/types/modal';
	import { i18nFormat } from '$lib/utils/i18n.utils';
	import { container } from '$lib/utils/juno.utils';
	import { satelliteName } from '$lib/utils/satellite.utils';

	interface Props {
		detail: JunoModalDetail;
		onclose: () => void;
	}

	let { detail, onclose }: Props = $props();

	let { satellite, currentVersion, newerReleases, build } = $derived(
		detail as JunoModalUpgradeSatelliteDetail
	);

	const upgradeSatelliteWasm = async (
		params: Pick<UpgradeCodeParams, 'wasmModule' | 'onProgress'>
	) =>
		await upgradeSatellite({
			satellite: {
				satelliteId: satellite.satellite_id.toText(),
				identity: $authStore.identity ?? new AnonymousIdentity(),
				...container()
			},
			...params,
			...(nonNullish($missionControlIdDerived) && { missionControlId: $missionControlIdDerived }),
			// TODO: option to be removed
			deprecated: compare(currentVersion, SATELLITE_v0_0_7) < 0,
			deprecatedNoScope: compare(currentVersion, SATELLITE_v0_0_9) < 0
		});

	const reloadVersion = async () => {
		await reloadSatelliteVersion({
			satelliteId: satellite.satellite_id,
			skipReload: false,
			identity: $authStore.identity ?? new AnonymousIdentity()
		});
	};
</script>

<CanisterUpgradeModal
	{onclose}
	{newerReleases}
	{currentVersion}
	{build}
	upgrade={upgradeSatelliteWasm}
	{reloadVersion}
	segment="satellite"
	canisterId={satellite.satellite_id}
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
