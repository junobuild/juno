<script lang="ts">
	import type { AccountIdentifier } from '@dfinity/ledger-icp';
	import { nonNullish } from '@dfinity/utils';
	import CanisterTopUpModal from '$lib/components/modals/CanisterTopUpModal.svelte';
	import Html from '$lib/components/ui/Html.svelte';
	import { balanceOrZero } from '$lib/derived/balance.derived';
	import { missionControlIdDerived } from '$lib/derived/mission-control.derived';
	import { i18n } from '$lib/stores/i18n.store';
	import type { JunoModalDetail, JunoModalTopUpMissionControlDetail } from '$lib/types/modal';
	import { i18nFormat } from '$lib/utils/i18n.utils';

	interface Props {
		detail: JunoModalDetail;
		onclose: () => void;
	}

	let { detail, onclose }: Props = $props();

	let accountIdentifier: AccountIdentifier | undefined = $derived(
		(detail as JunoModalTopUpMissionControlDetail).accountIdentifier
	);
</script>

{#if nonNullish($missionControlIdDerived)}
	<CanisterTopUpModal
		{accountIdentifier}
		balance={$balanceOrZero}
		{onclose}
		segment={{
			segment: 'mission_control',
			canisterId: $missionControlIdDerived.toText(),
			label: $i18n.mission_control.title
		}}
	>
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
