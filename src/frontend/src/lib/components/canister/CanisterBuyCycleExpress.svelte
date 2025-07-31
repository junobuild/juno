<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import { nonNullish } from '@dfinity/utils';
	import { onDestroy } from 'svelte';
	import IconShoppingCart from '$lib/components/icons/IconShoppingCart.svelte';
	import { busy } from '$lib/stores/busy.store';
	import { i18n } from '$lib/stores/i18n.store';
	import { emit } from '$lib/utils/events.utils';
	import { popupCenter } from '$lib/utils/window.utils';

	interface Props {
		canisterId: Principal;
	}

	let { canisterId }: Props = $props();

	let interval: NodeJS.Timeout | undefined = $state(undefined);

	const clear = () => clearInterval(interval);

	// eslint-disable-next-line require-await
	const buyCycles = async () => {
		busy.show();

		const popup = window.open(
			`https://cycle.express/?to=${canisterId.toText()}`,
			'cycle.express',
			popupCenter({ width: 576, height: 750 })
		);

		const reloadCycles = () => {
			if (popup?.closed === false) {
				return;
			}

			clear();

			emit({ message: 'junoRestartCycles', detail: { canisterId } });

			busy.stop();
		};

		interval = setInterval(reloadCycles, 1000);
	};

	onDestroy(clear);

	const CYCLE_EXPRESS_URL = import.meta.env.VITE_CYCLE_EXPRESS_URL;
</script>

{#if nonNullish(CYCLE_EXPRESS_URL)}
	<button class="menu" onclick={buyCycles}><IconShoppingCart /> {$i18n.canisters.buy_cycles}</button
	>
{/if}
