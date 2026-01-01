<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import CanisterTopUpModal from '$lib/components/modals/cycles/top-up/CanisterTopUpModal.svelte';
	import Html from '$lib/components/ui/Html.svelte';
	import { missionControlId } from '$lib/derived/console/account.mission-control.derived';
	import { i18n } from '$lib/stores/app/i18n.store';
	import { i18nFormat } from '$lib/utils/i18n.utils';

	interface Props {
		onclose: () => void;
	}

	let { onclose }: Props = $props();
</script>

{#if nonNullish($missionControlId)}
	<CanisterTopUpModal
		{onclose}
		segment={{
			segment: 'mission_control',
			canisterId: $missionControlId.toText(),
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
