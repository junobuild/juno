<script lang="ts">
	import IconUfo from '$lib/components/icons/IconUfo.svelte';
	import CanisterTopUpModal from '$lib/components/modals/cycles/top-up/CanisterTopUpModal.svelte';
	import Html from '$lib/components/ui/Html.svelte';
	import { i18n } from '$lib/stores/app/i18n.store';
	import type { JunoModalDetail, JunoModalTopUpUfoDetail } from '$lib/types/modal';
	import { i18nFormat } from '$lib/utils/i18n.utils';
	import { metadataUiName } from '$lib/utils/metadata-ui.utils';

	interface Props {
		detail: JunoModalDetail;
		onclose: () => void;
	}

	let { detail, onclose }: Props = $props();

	let { ufo } = $derived(detail as JunoModalTopUpUfoDetail);
</script>

<CanisterTopUpModal
	{onclose}
	segment={{
		segment: 'ufo',
		canisterId: ufo.ufo_id.toText(),
		label: metadataUiName(ufo)
	}}
>
	{#snippet intro()}
		<h2>
			<Html
				text={i18nFormat($i18n.canisters.top_up_title, [
					{
						placeholder: '{0}',
						value: metadataUiName(ufo)
					}
				])}
			/>
		</h2>
	{/snippet}

	{#snippet outro()}
		<IconUfo />
		<p>{$i18n.canisters.top_up_ufo_done}</p>
	{/snippet}
</CanisterTopUpModal>
