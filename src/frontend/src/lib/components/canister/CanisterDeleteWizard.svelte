<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import { isNullish, nonNullish } from '@dfinity/utils';
	import { createEventDispatcher } from 'svelte';
	import { run, preventDefault } from 'svelte/legacy';
	import { goto } from '$app/navigation';
	import IconWarning from '$lib/components/icons/IconWarning.svelte';
	import Html from '$lib/components/ui/Html.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import SpinnerModal from '$lib/components/ui/SpinnerModal.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { ONE_TRILLION, DEFAULT_TCYCLES_TO_RETAIN_ON_DELETION } from '$lib/constants/constants';
	import { authSignedIn } from '$lib/derived/auth.derived';
	import { missionControlStore } from '$lib/derived/mission-control.derived';
	import { loadSatellites } from '$lib/services/satellites.services';
	import { isBusy, wizardBusy } from '$lib/stores/busy.store';
	import { i18n } from '$lib/stores/i18n.store';
	import { toasts } from '$lib/stores/toasts.store';
	import { formatTCycles } from '$lib/utils/cycles.utils';
	import { i18nCapitalize, i18nFormat } from '$lib/utils/i18n.utils';

	interface Props {
		segmentName?: string;
		segment: 'satellite' | 'analytics';
		currentCycles: bigint;
		deleteFn: (params: { missionControlId: Principal; cyclesToDeposit: bigint }) => Promise<void>;
	}

	let { segment, segmentName, currentCycles, deleteFn }: Props = $props();

	let steps: 'init' | 'in_progress' | 'error' = $state('init');

	const dispatch = createEventDispatcher();
	const close = () => dispatch('junoClose');

	let tCycles = $state(DEFAULT_TCYCLES_TO_RETAIN_ON_DELETION);

	let cycles: bigint | undefined = $state(undefined);
	run(() => {
		(() => {
			if (isNaN(tCycles)) {
				return;
			}

			cycles = BigInt(tCycles * ONE_TRILLION);
		})();
	});

	let cyclesToDeposit: bigint = $derived(
		currentCycles - (cycles ?? 0n) > 0 ? currentCycles - (cycles ?? 0n) : 0n
	);

	let validConfirm = $derived(nonNullish(cycles) && cycles > 0 && cycles <= currentCycles);

	const onSubmit = async () => {
		if (!$authSignedIn) {
			toasts.error({
				text: $i18n.errors.no_identity
			});
			return;
		}

		if (isNullish($missionControlStore)) {
			toasts.error({
				text: $i18n.errors.no_mission_control
			});
			return;
		}

		if (cyclesToDeposit > currentCycles || cyclesToDeposit === 0n) {
			toasts.error({
				text: $i18n.errors.invalid_cycles_to_transfer
			});
			return;
		}

		steps = 'in_progress';

		wizardBusy.start();

		try {
			await deleteFn({
				missionControlId: $missionControlStore,
				cyclesToDeposit
			});

			await loadSatellites({
				missionControl: $missionControlStore,
				reload: true
			});

			await goto('/', { replaceState: true });

			close();

			toasts.success(
				i18nCapitalize(
					i18nFormat($i18n.canisters.delete_success, [
						{
							placeholder: '{0}',
							value: segment
						}
					])
				)
			);
		} catch (err: unknown) {
			steps = 'error';

			toasts.error({
				text: $i18n.errors.canister_delete,
				detail: err
			});
		}

		wizardBusy.stop();
	};
</script>

{#if steps === 'in_progress'}
	<SpinnerModal>
		<p>{$i18n.canisters.delete_in_progress}</p>
	</SpinnerModal>
{:else}
	<form onsubmit={preventDefault(onSubmit)}>
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

		<Value ref="cycles">
			{#snippet label()}
				{$i18n.canisters.cycles_to_retain}
			{/snippet}

			<Input
				name="cycles"
				inputType="icp"
				required
				bind:value={tCycles}
				placeholder={$i18n.canisters.amount}
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

		<button type="submit" class="submit" disabled={$isBusy || !validConfirm}>
			{$i18n.core.delete}
		</button>
	</form>
{/if}

<style lang="scss">
	.warning {
		padding: var(--padding) 0 0;
	}
</style>
