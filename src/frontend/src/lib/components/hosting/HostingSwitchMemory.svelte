<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import type { Satellite } from '$declarations/mission_control/mission_control.did';
	import type { Memory } from '$declarations/satellite/satellite.did';
	import Confirmation from '$lib/components/core/Confirmation.svelte';
	import { countHostingAssets, switchHostingMemory } from '$lib/services/hosting.storage.services';
	import { authStore } from '$lib/stores/auth.store';
	import { busy } from '$lib/stores/busy.store';
	import { i18n } from '$lib/stores/i18n.store';
	import { toasts } from '$lib/stores/toasts.store';
	import { i18nFormat } from '$lib/utils/i18n.utils';

	interface Props {
		satellite: Satellite;
		memory: Memory | undefined;
		reload: () => Promise<void>;
	}

	let { satellite, memory, reload }: Props = $props();

	let visible = $state(false);

	const open = async ($event: MouseEvent | TouchEvent) => {
		$event.stopPropagation();

		busy.start();

		const result = await countHostingAssets({
			satellite,
			identity: $authStore.identity
		});

		busy.stop();

		if (result.result !== 'success') {
			return;
		}

		if (result.count > 0n) {
			toasts.warn($i18n.hosting.warn_clear);
			return;
		}

		visible = true;
	};

	const switchMemory = async () => {
		const { result } = await switchHostingMemory({
			satellite,
			identity: $authStore.identity
		});

		if (result === 'error') {
			return;
		}

		// We are on purpose no awaiting. There will be a slight delay at updating the UI but, it's fine.
		reload();

		close();
	};

	const close = () => (visible = false);
</script>

<button onclick={open}>{$i18n.hosting.switch_memory}</button>

<Confirmation bind:visible on:junoYes={switchMemory} on:junoNo={close}>
	{#snippet title()}
		{$i18n.hosting.switch_memory}
	{/snippet}

	<p>
		{i18nFormat($i18n.hosting.switch_memory_confirm, [
			{
				placeholder: '{0}',
				value:
					nonNullish(memory) && 'Stable' in memory
						? $i18n.collections.stable
						: $i18n.collections.heap
			}
		])}
	</p>
</Confirmation>

<style lang="scss">
	button {
		margin: 0 0 var(--padding-8x);
	}
</style>
