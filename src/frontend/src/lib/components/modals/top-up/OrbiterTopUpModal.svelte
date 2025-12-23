<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import CanisterTopUpModal from '$lib/components/modals/top-up/CanisterTopUpModal.svelte';
	import Html from '$lib/components/ui/Html.svelte';
	import { orbiterStore } from '$lib/derived/orbiter.derived';
	import { i18n } from '$lib/stores/app/i18n.store';
	import { i18nFormat } from '$lib/utils/i18n.utils';

	interface Props {
		onclose: () => void;
	}

	let { onclose }: Props = $props();
</script>

{#if nonNullish($orbiterStore)}
	<CanisterTopUpModal
		{onclose}
		segment={{
			segment: 'orbiter',
			canisterId: $orbiterStore.orbiter_id.toText(),
			label: $i18n.analytics.orbiter
		}}
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
