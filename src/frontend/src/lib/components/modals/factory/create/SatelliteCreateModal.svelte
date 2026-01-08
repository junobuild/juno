<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import type { PrincipalText } from '@dfinity/zod-schemas';
	import type { MissionControlDid } from '$declarations';
	import FactoryAdvancedOptions from '$lib/components/factory/create/FactoryAdvancedOptions.svelte';
	import FactoryContinue from '$lib/components/factory/create/FactoryContinue.svelte';
	import FactoryCredits from '$lib/components/factory/create/FactoryCredits.svelte';
	import FactoryProgressCreate from '$lib/components/factory/create/FactoryProgressCreate.svelte';
	import Confetti from '$lib/components/ui/Confetti.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { testIds } from '$lib/constants/test-ids.constants';
	import { authSignedOut, authIdentity } from '$lib/derived/auth.derived';
	import { missionControlId } from '$lib/derived/console/account.mission-control.derived';
	import type { SelectedWallet } from '$lib/schemas/wallet.schema';
	import { createSatelliteWizard } from '$lib/services/factory/factory.create.services';
	import { wizardBusy } from '$lib/stores/app/busy.store';
	import { i18n } from '$lib/stores/app/i18n.store';
	import type { JunoModalDetail } from '$lib/types/modal';
	import type { FactoryCreateProgress } from '$lib/types/progress-factory-create';
	import type { SatelliteId } from '$lib/types/satellite';
	import type { Option } from '$lib/types/utils';
	import { navigateToSatellite } from '$lib/utils/nav.utils';
	import { testId } from '$lib/utils/test.utils';

	interface Props {
		detail: JunoModalDetail;
		onclose: () => void;
	}

	let { detail, onclose }: Props = $props();

	let withFee = $state<Option<bigint>>(undefined);
	let insufficientFunds = $state(true);

	let step: 'init' | 'in_progress' | 'ready' | 'error' = $state('init');
	let satelliteId = $state<SatelliteId | undefined>(undefined);

	// Submit

	let progress: FactoryCreateProgress | undefined = $state(undefined);
	const onProgress = (applyProgress: FactoryCreateProgress | undefined) =>
		(progress = applyProgress);

	const onSubmit = async ($event: SubmitEvent) => {
		$event.preventDefault();

		onProgress(undefined);

		wizardBusy.start();
		step = 'in_progress';

		const result = await createSatelliteWizard({
			selectedWallet,
			identity: $authIdentity,
			missionControlId: $missionControlId,
			subnetId,
			monitoringStrategy,
			satelliteName,
			satelliteKind,
			withFee,
			onProgress
		});

		wizardBusy.stop();

		if (result.success !== 'ok') {
			step = 'error';
			return;
		}

		satelliteId = result.canisterId;

		setTimeout(() => (step = 'ready'), 500);
	};

	const navigate = async () => {
		await navigateToSatellite(satelliteId);
	};

	let satelliteName = $state<string | undefined>(undefined);
	let satelliteKind = $state<'website' | 'application' | undefined>(undefined);

	let selectedWallet = $state<SelectedWallet | undefined>(undefined);
	let subnetId: PrincipalText | undefined = $state();
	let monitoringStrategy = $state<MissionControlDid.CyclesMonitoringStrategy | undefined>(
		undefined
	);
</script>

<Modal {onclose}>
	{#if step === 'ready'}
		<Confetti />

		<FactoryContinue {navigate} {onclose} testId={testIds.createSatellite.continue}>
			{$i18n.satellites.ready}
		</FactoryContinue>
	{:else if step === 'in_progress'}
		<FactoryProgressCreate
			{progress}
			segment="satellite"
			withApprove={selectedWallet?.type === 'dev' && nonNullish(withFee)}
			withAttach={selectedWallet?.type === 'dev' && nonNullish($missionControlId)}
			withMonitoring={nonNullish(monitoringStrategy)}
		/>
	{:else}
		<h2>{$i18n.satellites.start}</h2>

		<p>
			{$i18n.satellites.description}
		</p>

		<FactoryCredits
			{detail}
			{onclose}
			priceLabel={$i18n.satellites.create_satellite_price}
			{selectedWallet}
			bind:withFee
			bind:insufficientFunds
		>
			<form onsubmit={onSubmit}>
				<Value>
					{#snippet label()}
						{$i18n.satellites.satellite_name}
					{/snippet}
					<input
						name="satellite_name"
						autocomplete="off"
						data-1p-ignore
						{...testId(testIds.createSatellite.input)}
						placeholder={$i18n.satellites.enter_name}
						required
						type="text"
						bind:value={satelliteName}
					/>
				</Value>

				<div class="building">
					<Value suffix="?">
						{#snippet label()}
							{$i18n.satellites.what_are_you_building}
						{/snippet}

						<div class="options">
							<label>
								<input
									name="kind"
									type="radio"
									{...testId(testIds.createSatellite.website)}
									value="website"
									bind:group={satelliteKind}
								/>
								<span class="option">
									<span>{$i18n.satellites.website}</span>
									<span>({$i18n.satellites.website_description})</span>
								</span>
							</label>

							<label>
								<input
									name="kind"
									type="radio"
									{...testId(testIds.createSatellite.application)}
									value="application"
									bind:group={satelliteKind}
								/>
								<span class="option">
									<span>{$i18n.satellites.application}</span>
									<span>({$i18n.satellites.application_description})</span>
								</span>
							</label>
						</div>
					</Value>
				</div>

				<FactoryAdvancedOptions
					{detail}
					bind:selectedWallet
					bind:subnetId
					bind:monitoringStrategy
				/>

				<button
					{...testId(testIds.createSatellite.create)}
					disabled={$authSignedOut || insufficientFunds}
					type="submit"
				>
					{$i18n.satellites.create}
				</button>
			</form>
		</FactoryCredits>
	{/if}
</Modal>

<style lang="scss">
	@use '../../../../styles/mixins/overlay';

	h2 {
		@include overlay.title;
	}

	form {
		display: flex;
		flex-direction: column;

		padding: var(--padding) 0 0;
	}

	button {
		margin-top: var(--padding-2x);
	}

	.building {
		margin: var(--padding-2x) 0 0;
	}

	.options {
		display: flex;
		flex-direction: column;
		padding: var(--padding) 0 var(--padding-6x);
	}

	.option {
		span:last-child {
			font-size: var(--font-size-very-small);
		}
	}

	input {
		vertical-align: middle;
	}
</style>
