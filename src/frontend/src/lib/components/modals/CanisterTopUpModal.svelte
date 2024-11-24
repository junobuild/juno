<script lang="ts">
	import type { AccountIdentifier } from '@dfinity/ledger-icp';
	import type { Principal } from '@dfinity/principal';
	import { isNullish, nonNullish } from '@dfinity/utils';
	import { createEventDispatcher, onMount, type Snippet } from 'svelte';
	import { run, preventDefault } from 'svelte/legacy';
	import { icpXdrConversionRate } from '$lib/api/cmc.api';
	import { topUp } from '$lib/api/mission-control.api';
	import MissionControlICPInfo from '$lib/components/mission-control/MissionControlICPInfo.svelte';
	import ExternalLink from '$lib/components/ui/ExternalLink.svelte';
	import Html from '$lib/components/ui/Html.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import SpinnerModal from '$lib/components/ui/SpinnerModal.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { E8S_PER_ICP, IC_TRANSACTION_FEE_ICP } from '$lib/constants/constants';
	import { authStore } from '$lib/stores/auth.store';
	import { wizardBusy } from '$lib/stores/busy.store';
	import { i18n } from '$lib/stores/i18n.store';
	import { missionControlStore } from '$lib/stores/mission-control.store';
	import { toasts } from '$lib/stores/toasts.store';
	import { formatTCycles, icpToCycles } from '$lib/utils/cycles.utils';
	import { emit } from '$lib/utils/events.utils';
	import { i18nFormat } from '$lib/utils/i18n.utils';
	import { formatE8sICP } from '$lib/utils/icp.utils';
	import type { Segment } from '$lib/types/canister';

	interface Props {
		canisterId: Principal;
		balance: bigint;
		accountIdentifier: AccountIdentifier | undefined;
		outro?: Snippet;
		intro?: Snippet;
		segment: Segment;
	}

	let { canisterId, balance, accountIdentifier, outro, intro, segment }: Props = $props();

	let steps: 'init' | 'in_progress' | 'ready' | 'error' = $state('init');

	let trillionRatio: bigint | undefined = $state();
	onMount(async () => (trillionRatio = await icpXdrConversionRate()));

	let icp: number | undefined = $state(undefined);

	const networkFees = 2n * IC_TRANSACTION_FEE_ICP;

	let validIcp = $state(false);
	run(() => {
		validIcp =
			nonNullish(icp) &&
			icp > 0 &&
			icp < Number(balance) / Number(E8S_PER_ICP) &&
			icp > Number(networkFees) / Number(E8S_PER_ICP);
	});

	let cycles: number | undefined = $derived(
		nonNullish(trillionRatio) && validIcp && nonNullish(icp)
			? icpToCycles({ icp, trillionRatio })
			: undefined
	);

	let validCycles = $state(false);
	run(() => {
		validCycles = nonNullish(cycles);
	});

	const onSubmit = async () => {
		if (isNullish($missionControlStore)) {
			toasts.error({
				text: $i18n.errors.no_mission_control
			});
			return;
		}

		if (isNullish(icp) || !validIcp || !validCycles) {
			toasts.error({
				text: `Invalid amount to top-up.`
			});
			return;
		}

		wizardBusy.start();
		steps = 'in_progress';

		try {
			await topUp({
				canisterId,
				missionControlId: $missionControlStore,
				e8s: BigInt(icp * Number(E8S_PER_ICP)),
				identity: $authStore.identity
			});

			emit({ message: 'junoRestartCycles', detail: { canisterId } });

			steps = 'ready';
		} catch (err: unknown) {
			toasts.error({
				text: $i18n.errors.top_up_error,
				detail: err
			});

			steps = 'error';
		}

		wizardBusy.stop();
	};

	const dispatch = createEventDispatcher();
	const close = () => dispatch('junoClose');
</script>

<Modal on:junoClose>
	{#if steps === 'ready'}
		<div class="msg">
			{@render outro?.()}
			<button onclick={close}>{$i18n.core.close}</button>
		</div>
	{:else if steps === 'in_progress'}
		<SpinnerModal>
			<p>{$i18n.canisters.top_up_in_progress}</p>
		</SpinnerModal>
	{:else}
		{@render intro?.()}

		<p>
			{i18nFormat($i18n.canisters.cycles_description, [
				{
					placeholder: '{0}',
					value: segment
				}
			])}
			<Html
				text={i18nFormat($i18n.canisters.top_up_info, [
					{
						placeholder: '{0}',
						value: formatE8sICP(balance)
					},
					{
						placeholder: '{1}',
						value: formatE8sICP(networkFees)
					}
				])}
			/>
		</p>

		{#if balance <= networkFees}
			<MissionControlICPInfo {accountIdentifier} onclose={close} />
		{:else}
			<form onsubmit={preventDefault(onSubmit)}>
				<div>
					<Value>
						{#snippet label()}
							ICP
						{/snippet}
						<Input
							name="icp"
							inputType="icp"
							required
							bind:value={icp}
							placeholder={$i18n.canisters.amount}
						/>
					</Value>
				</div>

				<div class="cycles">
					<Value>
						{#snippet label()}
							{$i18n.canisters.additional_cycles}
						{/snippet}
						{nonNullish(cycles) ? `${formatTCycles(BigInt(cycles ?? 0))}` : '0'} TCycles
					</Value>
				</div>

				<button
					type="submit"
					disabled={isNullish($missionControlStore) || !validIcp || !validCycles}
					>{$i18n.canisters.top_up}</button
				>
			</form>
		{/if}
	{/if}
</Modal>

<style lang="scss">
	@use '../../styles/mixins/overlay';

	p {
		min-height: 24px;
	}

	.msg {
		@include overlay.message;
	}

	button {
		margin-top: var(--padding-2x);
	}

	.cycles {
		padding: var(--padding) 0 0;
	}
</style>
