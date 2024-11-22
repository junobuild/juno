<script lang="ts">
	import IconShoppingCart from '$lib/components/icons/IconShoppingCart.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import type { Principal } from '@dfinity/principal';
	import { popupCenter } from '$lib/utils/window.utils';
	import { AUTH_POPUP_HEIGHT, AUTH_POPUP_WIDTH } from '$lib/constants/constants';
	import { onDestroy } from 'svelte';
	import { emit } from '$lib/utils/events.utils';
	import { busy } from '$lib/stores/busy.store';
	import { nonNullish } from '@dfinity/utils';

	interface Props {
		canisterId: Principal;
	}

	let { canisterId }: Props = $props();

	let interval: NodeJS.Timeout | undefined = $state(undefined);

	const clear = () => clearInterval(interval);

	const buyCycles = async () => {
		busy.show();

		const popup = window.open(
			`https://cycle.express/to=${canisterId.toText()}`,
			'cycle.express',
			popupCenter({ width: 576, height: 650 })
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
	<button onclick={buyCycles} class="menu"><IconShoppingCart /> {$i18n.canisters.buy_cycles}</button
	>
{/if}
