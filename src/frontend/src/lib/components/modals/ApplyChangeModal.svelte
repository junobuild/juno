<script lang="ts">
	import Modal from '$lib/components/ui/Modal.svelte';
	import type { JunoModalChangeDetail, JunoModalDetail } from '$lib/types/modal';
	import ApplyChangeWizard from '$lib/components/changes/wizard/ApplyChangeWizard.svelte';
	import SpinnerModal from '$lib/components/ui/SpinnerModal.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import { isNullish, nonNullish } from '@dfinity/utils';
	import CanisterUpgradeWizard, {
		type CanisterUpgradeWizardProps, type CanisterUpgradeWizardStep
	} from '$lib/components/canister/CanisterUpgradeWizard.svelte';
	import { Principal } from '@dfinity/principal';
	import { i18nFormat } from '$lib/utils/i18n.utils';
	import Html from '$lib/components/ui/Html.svelte';
	import { type UpgradeCodeParams, upgradeSatellite } from '@junobuild/admin';
	import { AnonymousIdentity } from '@dfinity/agent';
	import { container } from '$lib/utils/juno.utils';
	import { authStore } from '$lib/stores/auth.store';
	import { missionControlIdDerived } from '$lib/derived/mission-control.derived';
	import {findWasmAssetForProposal} from "$lib/services/cdn.services";
	import type {Asset} from "@junobuild/storage";
	import type {Wasm} from "$lib/types/upgrade";

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
				'showUpgradeExtendedWarning' | 'segment' | 'onclose' | 'canisterId'
		  >
		| undefined
	>(undefined);

	let asset = $state<Asset | undefined>(undefined);

	const startUpgrade = async () => {
		step = 'prepare_upgrade';

		const result = await findWasmAssetForProposal({
			satelliteId,
			proposal,
			identity: $authStore.identity
		})

		if (isNullish(result)) {
			onclose();
			return;
		}

		asset = result;

		upgradeBaseParams = {
			showUpgradeExtendedWarning: false,
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

	let takeSnapshot = $state(true);

	let wasm: Wasm | undefined = $state(undefined);

	let upgradeStep = $state<CanisterUpgradeWizardStep>('init');

	const onnext = ({
						steps: s,
						wasm: w
					}: {
		steps: 'review' | 'error' | 'download';
		wasm?: Wasm;
	}) => {
		wasm = w;
		upgradeStep = s;
	};
</script>

<Modal {onclose}>
	{#if step === 'change'}
		<ApplyChangeWizard {proposal} {satelliteId} {onclose} {startUpgrade} />
	{:else if step === 'prepare_upgrade'}
		<SpinnerModal>
			<p>{$i18n.canisters.upgrade_preparing}</p>
		</SpinnerModal>
	{:else if nonNullish(upgradeBaseParams) && step === 'upgrade'}
		<CanisterUpgradeWizard {...upgradeBaseParams} {takeSnapshot} {wasm} upgrade={upgradeSatelliteWasm} bind:step={upgradeStep}>
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

				<p>You blahblah {asset?.downloadUrl}</p>

			{/snippet}
		</CanisterUpgradeWizard>
	{/if}
</Modal>
