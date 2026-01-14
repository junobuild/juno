<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import { Principal } from '@icp-sdk/core/principal';
	import { untrack } from 'svelte';
	import { goto } from '$app/navigation';
	import InputCanisterId from '$lib/components/core/InputCanisterId.svelte';
	import FactoryProgressDelete from '$lib/components/factory/delete/FactoryProgressDelete.svelte';
	import IconWarning from '$lib/components/icons/IconWarning.svelte';
	import Html from '$lib/components/ui/Html.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import {
		ONE_TRILLION,
		DEFAULT_TCYCLES_TO_RETAIN_ON_DELETION
	} from '$lib/constants/app.constants';
	import { isBusy } from '$lib/derived/app/busy.derived';
	import { authIdentity } from '$lib/derived/auth.derived';
	import { missionControlId } from '$lib/derived/console/account.mission-control.derived';
	import { deleteSegmentWizard } from '$lib/services/factory/factory.delete.services';
	import { wizardBusy } from '$lib/stores/app/busy.store';
	import { i18n } from '$lib/stores/app/i18n.store';
	import { toasts } from '$lib/stores/app/toasts.store';
	import type { FactoryDeleteProgress } from '$lib/types/progress-factory-delete';
	import { formatTCycles } from '$lib/utils/cycles.utils';
	import { i18nCapitalize, i18nFormat } from '$lib/utils/i18n.utils';

	interface Props {
		segmentName?: string;
		segment: 'satellite' | 'analytics';
		segmentId: Principal;
		currentCycles: bigint;
		monitoringEnabled: boolean;
		onclose: () => void;
	}

	let { segment, segmentId, segmentName, currentCycles, monitoringEnabled, onclose }: Props =
		$props();

	let step: 'init' | 'in_progress' | 'error' = $state('init');

	let tCycles = $state(DEFAULT_TCYCLES_TO_RETAIN_ON_DELETION);

	let cycles: bigint | undefined = $state(undefined);
	$effect(() => {
		if (isNaN(tCycles)) {
			untrack(() => (cycles = undefined));
			return;
		}

		untrack(() => (cycles = BigInt(tCycles * ONE_TRILLION)));
	});

	let cyclesToDeposit = $derived(
		currentCycles - (cycles ?? 0n) > 0 ? currentCycles - (cycles ?? 0n) : 0n
	);

	let validConfirm = $derived(nonNullish(cycles) && cycles > 0 && cycles <= currentCycles);

	let progress: FactoryDeleteProgress | undefined = $state(undefined);
	const onProgress = (applyProgress: FactoryDeleteProgress | undefined) =>
		(progress = applyProgress);

	const onSubmit = async ($event: SubmitEvent) => {
		$event.preventDefault();

		if (cyclesToDeposit > currentCycles || cyclesToDeposit === 0n) {
			toasts.error({
				text: $i18n.errors.invalid_cycles_to_transfer
			});
			return;
		}

		if (!validDestinationCanisterId) {
			// Submit is disabled if not valid
			toasts.error({
				text: $i18n.errors.canister_id_missing
			});
			return;
		}

		step = 'in_progress';

		wizardBusy.start();

		const { result } = await deleteSegmentWizard({
			segmentId,
			segment: segment === 'analytics' ? 'orbiter' : 'satellite',
			cyclesToDeposit,
			canisterIdForDeposit: Principal.fromText(destinationCanisterId),
			monitoringEnabled,
			missionControlId: $missionControlId,
			identity: $authIdentity,
			onProgress
		});

		wizardBusy.stop();

		if (result !== 'ok') {
			step = 'error';
			return;
		}

		await goto('/', { replaceState: true });

		onclose();

		toasts.success({
			text: i18nCapitalize(
				i18nFormat($i18n.canisters.delete_success, [
					{
						placeholder: '{0}',
						value: segment
					}
				])
			)
		});
	};

	let validDestinationCanisterId = $state(false);
	let destinationCanisterId = $state('');
</script>

{#if step === 'in_progress'}
	<FactoryProgressDelete {progress} {segment} />
{:else}
	<form onsubmit={onSubmit}>
		<h2>
			<Html
				text={i18nFormat($i18n.canisters.delete_title, [
					{
						placeholder: '{0}',
						value: segmentName ?? segment.replace('_', ' ')
					}
				])}
			/>
		</h2>

		<p>
			<Html
				text={i18nFormat($i18n.canisters.delete_explanation, [
					{
						placeholder: '{0}',
						value: segment.replace('_', ' ')
					},
					{
						placeholder: '{1}',
						value: segment.replace('_', ' ')
					}
				])}
			/>
		</p>

		<p>
			<Html
				text={i18nFormat($i18n.canisters.delete_customization, [
					{
						placeholder: '{0}',
						value: segment.replace('_', ' ')
					},
					{
						placeholder: '{1}',
						value: formatTCycles(currentCycles)
					}
				])}
			/>
		</p>

		<div class="inputs">
			<div>
				<Value ref="cycles">
					{#snippet label()}
						{$i18n.canisters.cycles_to_retain}
					{/snippet}

					<Input
						name="cycles"
						inputType="icp"
						placeholder={$i18n.canisters.amount}
						required
						bind:value={tCycles}
					/>
				</Value>

				<p>
					<small
						><Html
							text={i18nFormat($i18n.canisters.cycles_to_transfer, [
								{
									placeholder: '{0}',
									value: formatTCycles(cyclesToDeposit)
								}
							])}
						/></small
					>
				</p>
			</div>

			<div>
				<InputCanisterId
					disabled={$isBusy}
					bind:canisterId={destinationCanisterId}
					bind:valid={validDestinationCanisterId}
				>
					{#snippet label()}
						{$i18n.canisters.destination_deposit}
					{/snippet}
				</InputCanisterId>
			</div>
		</div>

		<p class="warning">
			<IconWarning />
			<Html
				text={i18nFormat($i18n.canisters.delete_info, [
					{
						placeholder: '{0}',
						value: segment.replace('_', ' ')
					}
				])}
			/>
		</p>

		<button
			class="submit"
			disabled={$isBusy || !validConfirm || !validDestinationCanisterId}
			type="submit"
		>
			{$i18n.core.delete}
		</button>
	</form>
{/if}

<style lang="scss">
	@use '../../../styles/mixins/grid';
	@use '../../../styles/mixins/media';

	.warning {
		padding: var(--padding) 0 0;
	}

	.inputs {
		@include media.min-width(medium) {
			@include grid.two-columns;
		}
	}
</style>
