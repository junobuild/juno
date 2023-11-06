<script lang="ts">
	import { nonNullish } from '$lib/utils/utils';
	import CanisterTopUpModal from '$lib/components/modals/CanisterTopUpModal.svelte';
	import { i18nFormat } from '$lib/utils/i18n.utils';
	import { i18n } from '$lib/stores/i18n.store';
	import type { JunoModalDetail, JunoModalTopUpOrbiterDetail } from '$lib/types/modal';
	import type { AccountIdentifier } from '@junobuild/ledger';
	import { orbiterStore } from '$lib/stores/orbiter.store';

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
				{@html i18nFormat($i18n.canisters.top_up_title, [
					{
						placeholder: '{0}',
						value: 'orbiter'
					}
				])}
			</h2>
		</svelte:fragment>

		<svelte:fragment slot="outro">
			<p>{$i18n.canisters.top_up_orbiter_done}</p>
		</svelte:fragment>
	</CanisterTopUpModal>
{/if}
