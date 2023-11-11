<script lang="ts">
	import { missionControlStore } from '$lib/stores/mission-control.store';
	import { nonNullish } from '@dfinity/utils';
	import CanisterTopUpModal from '$lib/components/modals/CanisterTopUpModal.svelte';
	import { i18nFormat } from '$lib/utils/i18n.utils';
	import { i18n } from '$lib/stores/i18n.store';
	import type { JunoModalDetail, JunoModalTopUpMissionControlDetail } from '$lib/types/modal';
	import type { AccountIdentifier } from '@junobuild/ledger';

	export let detail: JunoModalDetail;

	let balance = 0n;
	let accountIdentifier: AccountIdentifier | undefined;

	$: balance = (detail as JunoModalTopUpMissionControlDetail).missionControlBalance?.balance ?? 0n;
	$: accountIdentifier = (detail as JunoModalTopUpMissionControlDetail).missionControlBalance
		?.accountIdentifier;
</script>

{#if nonNullish($missionControlStore)}
	<CanisterTopUpModal canisterId={$missionControlStore} {balance} {accountIdentifier} on:junoClose>
		<svelte:fragment slot="intro">
			<h2>
				{@html i18nFormat($i18n.canisters.top_up_title, [
					{
						placeholder: '{0}',
						value: 'mission control center'
					}
				])}
			</h2>
		</svelte:fragment>

		<svelte:fragment slot="outro">
			<p>{$i18n.canisters.top_up_mission_control_done}</p>
		</svelte:fragment>
	</CanisterTopUpModal>
{/if}
