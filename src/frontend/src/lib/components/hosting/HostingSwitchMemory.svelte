<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import type { SatelliteDid, MissionControlDid } from '$declarations';
	import Confirmation from '$lib/components/core/Confirmation.svelte';
	import { switchHostingMemory } from '$lib/services/hosting.storage.services';
	import { authStore } from '$lib/stores/auth.store';
	import { i18n } from '$lib/stores/i18n.store';
	import { i18nFormat } from '$lib/utils/i18n.utils';

	interface Props {
		satellite: MissionControlDid.Satellite;
		memory: SatelliteDid.Memory | undefined;
		reload: () => Promise<void>;
	}

	let { satellite, memory, reload }: Props = $props();

	let visible = $state(false);

	const open = () => (visible = true);

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
						? $i18n.collections.heap
						: $i18n.collections.stable
			}
		])}
	</p>
</Confirmation>

<style lang="scss">
	button {
		margin: 0 0 var(--padding-8x);
	}
</style>
