<script lang="ts">
	import type { AccountIdentifier } from '@dfinity/ledger-icp';
	import { nonNullish } from '@dfinity/utils';
	import { run } from 'svelte/legacy';
	import CanisterTopUpModal from '$lib/components/modals/CanisterTopUpModal.svelte';
	import Html from '$lib/components/ui/Html.svelte';
	import { orbiterStore } from '$lib/derived/orbiter.derived';
	import { i18n } from '$lib/stores/i18n.store';
	import type { JunoModalDetail, JunoModalTopUpOrbiterDetail } from '$lib/types/modal';
	import { i18nFormat } from '$lib/utils/i18n.utils';

	interface Props {
		detail: JunoModalDetail;
		onclose: () => void;
	}

	let { detail, onclose }: Props = $props();

	let balance = $state(0n);
	let accountIdentifier: AccountIdentifier | undefined = $derived(
		(detail as JunoModalTopUpOrbiterDetail).missionControlBalance?.accountIdentifier
	);

	run(() => {
		balance = (detail as JunoModalTopUpOrbiterDetail).missionControlBalance?.balance ?? 0n;
	});
</script>

{#if nonNullish($orbiterStore)}
	<CanisterTopUpModal
		segment="orbiter"
		canisterId={$orbiterStore.orbiter_id}
		{balance}
		{accountIdentifier}
		{onclose}
	>
		{#snippet intro()}
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
		{/snippet}

		{#snippet outro()}
			<p>{$i18n.canisters.top_up_orbiter_done}</p>
		{/snippet}
	</CanisterTopUpModal>
{/if}
