<script lang="ts">
	import type { AccountIdentifier } from '@dfinity/ledger-icp';
	import { nonNullish } from '@dfinity/utils';
	import CanisterTopUpModal from '$lib/components/modals/CanisterTopUpModal.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import { orbiterStore } from '$lib/stores/orbiter.store';
	import type { JunoModalDetail, JunoModalTopUpOrbiterDetail } from '$lib/types/modal';
	import { i18nFormat } from '$lib/utils/i18n.utils';
	import Html from '$lib/components/ui/Html.svelte';

	export let detail: JunoModalDetail;

	let balance = 0n;
	let accountIdentifier: AccountIdentifier | undefined;

	$: balance = (detail as JunoModalTopUpOrbiterDetail).missionControlBalance?.balance ?? 0n;
	$: accountIdentifier = (detail as JunoModalTopUpOrbiterDetail).missionControlBalance
		?.accountIdentifier;
</script>

{#if nonNullish($orbiterStore)}
	<CanisterTopUpModal
		canisterId={$orbiterStore.orbiter_id}
		{balance}
		{accountIdentifier}
		on:junoClose
	>
		<svelte:fragment slot="intro">
			<h2>
				<Html
					text={i18nFormat($i18n.canisters.top_up_title, [
						{
							placeholder: '{0}',
							value: 'orbiter'
						}
					])}
				/>
			</h2>
		</svelte:fragment>

		<svelte:fragment slot="outro">
			<p>{$i18n.canisters.top_up_orbiter_done}</p>
		</svelte:fragment>
	</CanisterTopUpModal>
{/if}
