<script lang="ts">
	import { AnonymousIdentity } from '@dfinity/agent';
	import { type UpgradeCodeParams, upgradeSatellite } from '@junobuild/admin';
	import { compare } from 'semver';
	import CanisterUpgradeModal from '$lib/components/modals/CanisterUpgradeModal.svelte';
	import Html from '$lib/components/ui/Html.svelte';
	import { authStore } from '$lib/stores/auth.store';
	import { i18n } from '$lib/stores/i18n.store';
	import type { JunoModalDetail, JunoModalUpgradeSatelliteDetail } from '$lib/types/modal';
	import { i18nFormat } from '$lib/utils/i18n.utils';
	import { container } from '$lib/utils/juno.utils';
	import { satelliteName } from '$lib/utils/satellite.utils';
	import { missionControlStore } from '$lib/stores/mission-control.store';
	import { nonNullish } from '@dfinity/utils';

	interface Props {
		detail: JunoModalDetail;
		onclose: () => void;
	}

	let { detail, onclose }: Props = $props();

	let { satellite, currentVersion, newerReleases, build } = $derived(
		detail as JunoModalUpgradeSatelliteDetail
	);

	const upgradeSatelliteWasm = async ({ wasmModule }: Pick<UpgradeCodeParams, 'wasmModule'>) =>
		await upgradeSatellite({
			satellite: {
				satelliteId: satellite.satellite_id.toText(),
				identity: $authStore.identity ?? new AnonymousIdentity(),
				...container()
			},
			wasmModule,
			...(nonNullish($missionControlStore) && { missionControlId: $missionControlStore }),
			// TODO: option to be removed
			deprecated: compare(currentVersion, '0.0.7') < 0,
			deprecatedNoScope: compare(currentVersion, '0.0.9') < 0
		});
</script>

<CanisterUpgradeModal
	{onclose}
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
