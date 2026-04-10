<script lang="ts">
	import type { Option } from '@dfinity/zod-schemas';
	import Html from '$lib/components/ui/Html.svelte';
	import { CYCLES, ICP } from '$lib/constants/token.constants';
	import { icpToUsd } from '$lib/derived/wallet/exchange.derived';
	import type { SelectedToken, SelectedWallet } from '$lib/schemas/wallet.schema';
	import { i18n } from '$lib/stores/app/i18n.store';
	import { formatCyclesToHTML } from '$lib/utils/cycles.utils';
	import { i18nFormat } from '$lib/utils/i18n.utils';
	import { formatICPToHTML } from '$lib/utils/icp.utils';
	import { isTokenIcp } from '$lib/utils/token.utils';

	interface Props {
		fee: bigint;
		selectedWallet: Option<SelectedWallet>;
	}

	let { selectedWallet, fee }: Props = $props();

	// Creating a module is either in cycles with dev wallet or in ICP with mission control.
	// We do not allow to switch token because we want to use only cycles anyway.
	// A dev account that has ICP is "a mistake". Mission Control being able to spin module is deprecated.
	let selectedToken = $derived<SelectedToken>(
		selectedWallet?.type === 'mission_control' ? ICP : CYCLES
	);
</script>

<Html
	text={i18nFormat($i18n.satellites.review_cost, [
		{
			placeholder: '{0}',
			value: isTokenIcp(selectedToken)
				? formatICPToHTML({ e8s: fee, bold: true, icpToUsd: $icpToUsd })
				: formatCyclesToHTML({ e12s: fee, bold: true })
		},
		{
			placeholder: '{1}',
			value:
				selectedWallet?.type === 'mission_control' ? $i18n.mission_control.title : $i18n.wallet.dev
		}
	])}
/>
