<script lang="ts">
	import { Principal } from '@dfinity/principal';
	import { isNullish, nonNullish } from '@dfinity/utils';
	import CanisterAdvancedOptions from '$lib/components/canister/CanisterAdvancedOptions.svelte';
	import CreditsGuard from '$lib/components/guards/CreditsGuard.svelte';
	import Confetti from '$lib/components/ui/Confetti.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import SpinnerModal from '$lib/components/ui/SpinnerModal.svelte';
	import { authSignedOut } from '$lib/derived/auth.derived';
	import { missionControlIdDerived } from '$lib/derived/mission-control.derived';
	import {
		createOrbiter,
		createOrbiterWithConfig,
		loadOrbiters
	} from '$lib/services/orbiters.services';
	import { wizardBusy } from '$lib/stores/busy.store';
	import { i18n } from '$lib/stores/i18n.store';
	import { toasts } from '$lib/stores/toasts.store';
	import type { PrincipalText } from '$lib/types/itentity';
	import type { JunoModalDetail } from '$lib/types/modal';

	interface Props {
		detail: JunoModalDetail;
		onclose: () => void;
	}

	let { detail, onclose }: Props = $props();

	let insufficientFunds = $state(true);

	let step: 'init' | 'in_progress' | 'ready' | 'error' = $state('init');

	const onSubmit = async ($event: SubmitEvent) => {
		$event.preventDefault();

		wizardBusy.start();
		step = 'in_progress';

		try {
			const fn = nonNullish(subnetId) ? createOrbiterWithConfig : createOrbiter;

			await fn({
				missionControlId: $missionControlIdDerived,
				config: {
					...(nonNullish(subnetId) && { subnetId: Principal.fromText(subnetId) })
				}
			});

			// Reload list of orbiters before navigation
			await loadOrbiters({ missionControlId: $missionControlIdDerived, reload: true });

			step = 'ready';
		} catch (err) {
			toasts.error({
				text: $i18n.errors.orbiter_unexpected_error,
				detail: err
			});

			step = 'error';
		}

		wizardBusy.stop();
	};

	const close = () => onclose();

	let subnetId: PrincipalText | undefined = $state();
</script>

<Modal on:junoClose={close}>
	{#if step === 'ready'}
		<Confetti />

		<div class="msg">
			<p>{$i18n.analytics.ready}</p>
			<button onclick={close}>{$i18n.core.close}</button>
		</div>
	{:else if step === 'in_progress'}
		<SpinnerModal>
			<p>{$i18n.analytics.initializing}</p>
		</SpinnerModal>
	{:else}
		<h2>{$i18n.analytics.start}</h2>

		<p>
			{$i18n.analytics.description}
		</p>

		<CreditsGuard
			{onclose}
			bind:insufficientFunds
			{detail}
			priceLabel={$i18n.analytics.create_orbiter_price}
		>
			<form onsubmit={onSubmit}>
				<CanisterAdvancedOptions bind:subnetId />

				<button
					type="submit"
					disabled={$authSignedOut || isNullish($missionControlIdDerived) || insufficientFunds}
					>{$i18n.analytics.create}</button
				>
			</form>
		</CreditsGuard>
	{/if}
</Modal>

<style lang="scss">
	@use '../../styles/mixins/overlay';

	h2 {
		@include overlay.title;
	}

	.msg {
		@include overlay.message;

		p {
			margin: var(--padding-8x) 0 0;
		}
	}
</style>
