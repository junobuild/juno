<script lang="ts">
	import { onMount } from 'svelte';
	import type { Asset } from '@junobuild/storage';
	import { findWasmAssetForProposal } from '$lib/services/proposals/proposals.segments.services';
	import { assertNonNullish, isNullish, nonNullish } from '@dfinity/utils';
	import { Principal } from '@dfinity/principal';
	import SpinnerModal from '$lib/components/ui/SpinnerModal.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import { i18nFormat } from '$lib/utils/i18n.utils';
	import Html from '$lib/components/ui/Html.svelte';
	import CanisterUpgradeWizard, {
		type CanisterUpgradeWizardProps,
		type CanisterUpgradeWizardStep
	} from '$lib/components/canister/CanisterUpgradeWizard.svelte';
	import { type UpgradeCodeParams, upgradeSatellite } from '@junobuild/admin';
	import { AnonymousIdentity } from '@dfinity/agent';
	import { container } from '$lib/utils/juno.utils';
	import type { Wasm } from '$lib/types/upgrade';
	import type { SatelliteIdText } from '$lib/types/satellite';
	import type { ProposalRecord } from '$lib/types/proposals';
	import { authStore } from '$lib/stores/auth.store';
	import { missionControlIdDerived } from '$lib/derived/mission-control.derived';
	import { wizardBusy } from '$lib/stores/busy.store';
	import { toasts } from '$lib/stores/toasts.store';
	import CanisterUpgradeOptions from '$lib/components/upgrade/wizard/CanisterUpgradeOptions.svelte';
	import { prepareWasmUpgrade } from '$lib/services/upgrade/upgrade.cdn.services';

	interface Props {
		satelliteId: SatelliteIdText;
		proposal: ProposalRecord;
		onclose: () => void;
	}

	let { onclose, satelliteId, proposal }: Props = $props();

	let asset = $state<Asset | undefined>(undefined);

	let upgradeBaseParams = $state<
		| Pick<
				CanisterUpgradeWizardProps,
				'showUpgradeExtendedWarning' | 'segment' | 'onclose' | 'canisterId'
		  >
		| undefined
	>(undefined);

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

		upgradeBaseParams = {
			showUpgradeExtendedWarning: false,
			segment: 'satellite',
			canisterId: Principal.fromText(satelliteId),
			onclose
		};

		asset = result;
	};

	onMount(loadAsset);

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

	const onSubmit = async ($event: SubmitEvent) => {
		$event.preventDefault();

		wizardBusy.start();

		onnext({ steps: 'download' });

		try {
			// TS guard. The form is not rendered if the asset is undefined.
			assertNonNullish(asset);

			const result = await prepareWasmUpgrade({ asset });

			if (result.result === 'error') {
				return;
			}

			const { wasm } = result;

			onnext({ steps: 'review', wasm });
		} catch (err: unknown) {
			toasts.error({
				text: $i18n.errors.upgrade_download_error,
				detail: err
			});

			onnext({ steps: 'error' });
		}

		wizardBusy.stop();
	};
</script>

{#if isNullish(asset) || isNullish(upgradeBaseParams)}
	<SpinnerModal>
		<p>{$i18n.canisters.upgrade_preparing}</p>
	</SpinnerModal>
{:else}
	<CanisterUpgradeWizard
		{...upgradeBaseParams}
		{takeSnapshot}
		{wasm}
		upgrade={upgradeSatelliteWasm}
		bind:step={upgradeStep}
	>
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

			<form onsubmit={onSubmit}>
				<p>
					<Html
						text={i18nFormat($i18n.changes.upgrade_cdn_source, [
							{
								placeholder: '{0}',
								value: asset?.fullPath ?? ''
							},
							{
								placeholder: '{1}',
								value: asset?.description ?? ''
							}
						])}
					/>
				</p>

				<CanisterUpgradeOptions bind:takeSnapshot />

				<div class="toolbar">
					<button type="button" onclick={onclose}>{$i18n.core.cancel}</button>
					<button type="submit">{$i18n.core.continue}</button>
				</div>
			</form>
		{/snippet}
	</CanisterUpgradeWizard>
{/if}

<style lang="scss">
	form {
		:global(code) {
			word-break: break-word;
		}
	}
</style>
