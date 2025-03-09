<script lang="ts">
	import { Principal } from '@dfinity/principal';
	import { createEventDispatcher } from 'svelte';
	import CanisterAttach from '$lib/components/canister/CanisterAttach.svelte';
	import IconLink from '$lib/components/icons/IconLink.svelte';
	import { attachSatellite } from '$lib/services/mission-control.services';
	import { i18n } from '$lib/stores/i18n.store';
	import { toasts } from '$lib/stores/toasts.store';
	import type { MissionControlId } from '$lib/types/mission-control';
	import { i18nCapitalize, i18nFormat } from '$lib/utils/i18n.utils';

	let visible = $state(false);

	const setSatellite = async ({
		missionControlId,
		canisterId
	}: {
		missionControlId: MissionControlId;
		canisterId: Principal;
	}) => {
		await attachSatellite({
			missionControlId,
			satelliteId: canisterId
		});
	};

	const dispatch = createEventDispatcher();

	const onSuccess = () => {
		toasts.success(
			i18nCapitalize(
				i18nFormat($i18n.canisters.attach_success, [
					{
						placeholder: '{0}',
						value: 'satellite'
					}
				])
			)
		);

		dispatch('junoAttach');
	};
</script>

<button onclick={() => (visible = true)} class="menu"><IconLink /> {$i18n.satellites.attach}</button
>

<CanisterAttach attach={onSuccess} bind:visible setFn={setSatellite}>
	{#snippet title()}
		{$i18n.satellites.attach}
	{/snippet}
	{#snippet input()}
		{$i18n.satellites.id}
	{/snippet}
</CanisterAttach>
