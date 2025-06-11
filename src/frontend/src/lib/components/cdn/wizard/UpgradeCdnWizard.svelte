<script lang="ts">
	import { AnonymousIdentity } from '@dfinity/agent';
	import { Principal } from '@dfinity/principal';
	import { isNullish, nonNullish } from '@dfinity/utils';
	import { type UpgradeCodeParams, upgradeSatellite } from '@junobuild/admin';
	import type { Asset } from '@junobuild/storage';
	import type { Satellite } from '$declarations/mission_control/mission_control.did';
	import CanisterUpgradeWizard, {
		type CanisterUpgradeWizardProps,
		type CanisterUpgradeWizardStep
	} from '$lib/components/canister/CanisterUpgradeWizard.svelte';
	import Html from '$lib/components/ui/Html.svelte';
	import SpinnerModal from '$lib/components/ui/SpinnerModal.svelte';
	import CanisterUpgradeOptions from '$lib/components/upgrade/wizard/CanisterUpgradeOptions.svelte';
	import { missionControlIdDerived } from '$lib/derived/mission-control.derived';
	import { prepareWasmUpgrade } from '$lib/services/upgrade/upgrade.cdn.services';
	import { authStore } from '$lib/stores/auth.store';
	import { wizardBusy } from '$lib/stores/busy.store';
	import { i18n } from '$lib/stores/i18n.store';
	import { toasts } from '$lib/stores/toasts.store';
	import type { Wasm } from '$lib/types/upgrade';
	import { i18nFormat } from '$lib/utils/i18n.utils';
	import { container } from '$lib/utils/juno.utils';
	import { satelliteName } from '$lib/utils/satellite.utils';

	interface Props {
		satellite: Satellite;
		asset: Asset | undefined;
		onclose: () => void;
	}

	let { onclose, satellite, asset }: Props = $props();

	let satelliteId = $derived(satellite.satellite_id.toText());

	let upgradeBaseParams = $derived<
		Pick<
			CanisterUpgradeWizardProps,
			'showUpgradeExtendedWarning' | 'segment' | 'onclose' | 'canisterId'
		>
	>({
		showUpgradeExtendedWarning: false,
		segment: 'satellite',
		canisterId: Principal.fromText(satelliteId),
		onclose
	});

	const upgradeSatelliteWasm = async (
		params: Pick<UpgradeCodeParams, 'wasmModule' | 'onProgress'>
	) =>
		await upgradeSatellite({
			satellite: {
				satelliteId,
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

		// TS guard. The form is not rendered if the asset is undefined.
		if (isNullish(asset)) {
			toasts.error({
				text: $i18n.errors.find_wasm_asset_for_proposal_asset_not_found
			});

			return;
		}

		wizardBusy.start();

		onnext({ steps: 'download' });

		const result = await prepareWasmUpgrade({ asset, satelliteId: satellite.satellite_id });

		if (result.result === 'error') {
			onnext({ steps: 'error' });
			wizardBusy.stop();

			return;
		}

		const { wasm } = result;

		onnext({ steps: 'review', wasm });
		wizardBusy.stop();
	};
</script>

{#if isNullish(asset)}
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
							value: satelliteName(satellite)
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
