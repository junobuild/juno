<script lang="ts">
	import ExternalLink from '$lib/components/ui/ExternalLink.svelte';
	import { testIds } from '$lib/constants/test-ids.constants';
	import { i18n } from '$lib/stores/app/i18n.store';
	import { testId } from '$lib/utils/test.utils';

	interface Props {
		onclose: () => void;
	}

	let { onclose }: Props = $props();
</script>

<p>
	{$i18n.wallet.transfer_info}
	<ExternalLink href="https://juno.build/docs/miscellaneous/wallet" underline
		>{$i18n.wallet.documentation}</ExternalLink
	>.
</p>

<button onclick={onclose} {...testId(testIds.wizard.closeInsufficientFunds)}
	>{$i18n.core.close}</button
>
