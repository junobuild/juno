<script lang="ts">
	import type { SelectedToken } from '$lib/schemas/wallet.schema';
	import { isTokenIcp } from '$lib/utils/token.utils';

	interface Props {
		selectedToken: SelectedToken;
	}

	let { selectedToken }: Props = $props();
</script>

<small>{isTokenIcp(selectedToken) ? 'ICP' : 'T Cycles'}</small>
