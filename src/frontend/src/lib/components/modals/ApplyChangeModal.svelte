<script lang="ts">
	import Modal from '$lib/components/ui/Modal.svelte';
	import type { JunoModalChangeDetail, JunoModalDetail } from '$lib/types/modal';
	import ApplyChangeWizard from '$lib/components/changes/wizard/ApplyChangeWizard.svelte';
	import SpinnerModal from '$lib/components/ui/SpinnerModal.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import { newerReleases } from '$lib/services/upgrade/upgrade.init.services';
	import { satellitesVersion } from '$lib/derived/version.derived';
	import { assertNonNullish, isNullish, nonNullish } from '@dfinity/utils';
	import CanisterUpgradeWizard, {
		type CanisterUpgradeWizardProps
	} from '$lib/components/canister/CanisterUpgradeWizard.svelte';
	import { Principal } from '@dfinity/principal';
	import { i18nFormat } from '$lib/utils/i18n.utils';
	import { satelliteName } from '$lib/utils/satellite.utils';
	import Html from '$lib/components/ui/Html.svelte';
	import { type UpgradeCodeParams, upgradeSatellite } from '@junobuild/admin';
	import { AnonymousIdentity } from '@dfinity/agent';
	import { container } from '$lib/utils/juno.utils';
	import { compare } from 'semver';
	import { SATELLITE_v0_0_7, SATELLITE_v0_0_9 } from '$lib/constants/version.constants';
	import { authStore } from '$lib/stores/auth.store';
	import { missionControlIdDerived } from '$lib/derived/mission-control.derived';

	interface Props {
		detail: JunoModalDetail;
		onclose: () => void;
	}

	let { detail, onclose }: Props = $props();

	let proposal = $derived((detail as JunoModalChangeDetail).proposal);
	let satelliteId = $derived((detail as JunoModalChangeDetail).satelliteId);

	let step: 'change' | 'prepare_upgrade' | 'upgrade' = $state('change');

	let upgradeBaseParams = $state<
		| Pick<
				CanisterUpgradeWizardProps,
				'currentVersion' | 'newerReleases' | 'build' | 'segment' | 'canisterId' | 'onclose'
		  >
		| undefined
	>(undefined);

	const startUpgrade = async () => {
		step = 'prepare_upgrade';

		const version = $satellitesVersion?.[satelliteId];

		// Base component for the changes is not rendered if undefined. Hence, it's rather a TS guard rather than a meaningful check.
		assertNonNullish(version);

		const { current: currentVersion } = version;

		const { result, error } = await newerReleases({
			currentVersion,
			segments: 'satellites'
		});

		if (nonNullish(error) || isNullish(result)) {
			onclose();
			return;
		}

		upgradeBaseParams = {
			currentVersion,
			newerReleases: result,
			build: version.build,
			segment: 'satellite',
			canisterId: Principal.fromText(satelliteId),
			onclose
		};

		step = 'upgrade';
	};

	const upgradeSatelliteWasm = async (
		params: Pick<UpgradeCodeParams, 'wasmModule' | 'onProgress'>
	) =>
		await upgradeSatellite({
			satellite: {
				satelliteId: satelliteId,
				identity: $authStore.identity ?? new AnonymousIdentity(),
				...container()
			},
			...params,
			...(nonNullish($missionControlIdDerived) && { missionControlId: $missionControlIdDerived }),
			// TODO: option to be removed
			deprecated: false, // Proposals supported > SATELLITE_v0_0_7,
			deprecatedNoScope: false // Proposals supported >  SATELLITE_v0_0_9
		});
</script>

<Modal {onclose}>
	{#if step === 'change'}
		<ApplyChangeWizard {proposal} {satelliteId} {onclose} {startUpgrade} />
	{:else if step === 'prepare_upgrade'}
		<SpinnerModal>
			<p>{$i18n.canisters.upgrade_preparing}</p>
		</SpinnerModal>
	{:else if nonNullish(upgradeBaseParams) && step === 'upgrade'}
		<CanisterUpgradeWizard {...upgradeBaseParams} upgrade={upgradeSatelliteWasm}>
			{#snippet intro()}
				<h2>
					<Html
						text={i18nFormat($i18n.canisters.upgrade_title, [
							{
								placeholder: '{0}',
								value: 'TODO'
							}
						])}
					/>
				</h2>
			{/snippet}
		</CanisterUpgradeWizard>
	{/if}
</Modal>
