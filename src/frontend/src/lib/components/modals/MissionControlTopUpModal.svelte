<script lang="ts">
	import { run } from 'svelte/legacy';

	import type { AccountIdentifier } from '@dfinity/ledger-icp';
	import { nonNullish } from '@dfinity/utils';
	import CanisterTopUpModal from '$lib/components/modals/CanisterTopUpModal.svelte';
	import Html from '$lib/components/ui/Html.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import { missionControlStore } from '$lib/stores/mission-control.store';
	import type { JunoModalDetail, JunoModalTopUpMissionControlDetail } from '$lib/types/modal';
	import { i18nFormat } from '$lib/utils/i18n.utils';

	interface Props {
		detail: JunoModalDetail;
	}

	let { detail }: Props = $props();

	let balance = $state(0n);
	let accountIdentifier: AccountIdentifier | undefined = $derived(
		(detail as JunoModalTopUpMissionControlDetail).missionControlBalance?.accountIdentifier
	);

	run(() => {
		balance = (detail as JunoModalTopUpMissionControlDetail).missionControlBalance?.balance ?? 0n;
	});
</script>

{#if nonNullish($missionControlStore)}
	<CanisterTopUpModal canisterId={$missionControlStore} {balance} {accountIdentifier} on:junoClose>
		{#snippet intro()}
			<h2>
				<Html
					text={i18nFormat($i18n.canisters.top_up_title, [
						{
							placeholder: '{0}',
							value: 'mission control center'
						}
					])}
				/>
			</h2>
		{/snippet}

		{#snippet outro()}
			<p>{$i18n.canisters.top_up_mission_control_done}</p>
		{/snippet}
	</CanisterTopUpModal>
{/if}
