<script lang="ts">
	import { Principal } from '@dfinity/principal';
	import { createEventDispatcher } from 'svelte';
	import CanisterAttach from '$lib/components/canister/CanisterAttach.svelte';
	import IconLink from '$lib/components/icons/IconLink.svelte';
	import { attachOrbiter } from '$lib/services/mission-control.services';
	import { i18n } from '$lib/stores/i18n.store';
	import { toasts } from '$lib/stores/toasts.store';
	import type { MissionControlId } from '$lib/types/mission-control';
	import { i18nCapitalize, i18nFormat } from '$lib/utils/i18n.utils';

	let visible: boolean = $state(false);

	const setOrbiter = async ({
		missionControlId,
		canisterId
	}: {
		missionControlId: MissionControlId;
		canisterId: Principal;
	}) => {
		await attachOrbiter({
			missionControlId,
			orbiterId: canisterId
		});
	};
	const dispatch = createEventDispatcher();

	const onSuccess = () => {
		toasts.success(
			i18nCapitalize(
				i18nFormat($i18n.canisters.attach_success, [
					{
						placeholder: '{0}',
						value: 'orbiter'
					}
				])
			)
		);

		dispatch('junoAttach');
	};
</script>

<button onclick={() => (visible = true)} class="menu"><IconLink /> {$i18n.analytics.attach}</button>

<CanisterAttach attach={onSuccess} bind:visible setFn={setOrbiter}>
	{#snippet title()}
		{$i18n.analytics.attach}
	{/snippet}
	{#snippet input()}
		{$i18n.analytics.attach_id}
	{/snippet}
</CanisterAttach>
