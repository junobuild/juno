<script lang="ts">
	import { Principal } from '@dfinity/principal';
	import { isNullish, nonNullish } from '@dfinity/utils';
	import { createEventDispatcher } from 'svelte';
	import { preventDefault } from 'svelte/legacy';
	import CanisterAdvancedOptions from '$lib/components/canister/CanisterAdvancedOptions.svelte';
	import CreditsGuard from '$lib/components/guards/CreditsGuard.svelte';
	import Confetti from '$lib/components/ui/Confetti.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import SpinnerModal from '$lib/components/ui/SpinnerModal.svelte';
	import {
		createOrbiter,
		createOrbiterWithConfig,
		loadOrbiters
	} from '$lib/services/orbiters.services';
	import { authSignedInStore } from '$lib/stores/auth.store';
	import { wizardBusy } from '$lib/stores/busy.store';
	import { i18n } from '$lib/stores/i18n.store';
	import { missionControlStore } from '$lib/stores/mission-control.store';
	import { toasts } from '$lib/stores/toasts.store';
	import type { PrincipalText } from '$lib/types/itentity';
	import type { JunoModalDetail } from '$lib/types/modal';

	interface Props {
		detail: JunoModalDetail;
		onclose: () => void;
	}

	let { detail, onclose }: Props = $props();

	let insufficientFunds = $state(true);

	let steps: 'init' | 'in_progress' | 'ready' | 'error' = $state('init');

	const onSubmit = async () => {
		wizardBusy.start();
		steps = 'in_progress';

		try {
			const fn = nonNullish(subnetId) ? createOrbiterWithConfig : createOrbiter;

			await fn({
				missionControl: $missionControlStore,
				config: {
					...(nonNullish(subnetId) && { subnetId: Principal.fromText(subnetId) })
				}
			});

			// Reload list of orbiters before navigation
			await loadOrbiters({ missionControl: $missionControlStore, reload: true });

			steps = 'ready';
		} catch (err) {
			toasts.error({
				text: $i18n.errors.orbiter_unexpected_error,
				detail: err
			});

			steps = 'error';
		}

		wizardBusy.stop();
	};

	const dispatch = createEventDispatcher();
	const close = () => dispatch('junoClose');

	let subnetId: PrincipalText | undefined = $state();
</script>

<Modal on:junoClose>
	{#if steps === 'ready'}
		<Confetti />

		<div class="msg">
			<p>{$i18n.analytics.ready}</p>
			<button onclick={close}>{$i18n.core.close}</button>
		</div>
	{:else if steps === 'in_progress'}
		<SpinnerModal>
			<p>{$i18n.analytics.initializing}</p>
		</SpinnerModal>
	{:else}
		<h2>{$i18n.analytics.start}</h2>

		<p>
			{$i18n.analytics.description}
		</p>

		<CreditsGuard
			onclose
			bind:insufficientFunds
			{detail}
			priceLabel={$i18n.analytics.create_orbiter_price}
		>
			<form onsubmit={preventDefault(onSubmit)}>
				<CanisterAdvancedOptions bind:subnetId />

				<button
					type="submit"
					disabled={!$authSignedInStore || isNullish($missionControlStore) || insufficientFunds}
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
