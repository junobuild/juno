<script lang="ts">
	import { i18n } from '$lib/stores/app/i18n.store';
	import ButtonTableAction from '$lib/components/ui/ButtonTableAction.svelte';
	import type { SatelliteDid } from '$declarations';
	import type { Satellite } from '$lib/types/satellite';
	import Popover from '$lib/components/ui/Popover.svelte';
	import Text from '$lib/components/ui/Text.svelte';
	import Confirmation from '$lib/components/app/core/Confirmation.svelte';
	import { busy } from '$lib/stores/app/busy.store';
	import { deleteWasmAsset } from '$lib/services/satellite/functions/cdn.services';
	import { authIdentity } from '$lib/derived/auth.derived';

	interface Props {
		asset: SatelliteDid.AssetNoContent;
		satellite: Satellite;
		reload: () => void;
	}

	let { asset, satellite, reload }: Props = $props();

	let { key } = $derived(asset);
	let { full_path } = $derived(key);

	let visible = $state(false);

	const openDelete = () => (visible = true);
	const close = () => (visible = false);

	const deleteAsset = async () => {
		busy.start();

		const result = await deleteWasmAsset({
			asset,
			satellite,
			identity: $authIdentity
		});

		busy.stop();

		if (result.status === 'error') {
			return;
		}

		reload();

		close();
	};
</script>

<ButtonTableAction ariaLabel={$i18n.hosting.delete} icon="delete" onaction={openDelete} />

<Confirmation onno={close} onyes={deleteAsset} bind:visible>
	{#snippet title()}
		{$i18n.cdn.delete_asset}
	{/snippet}

	<p><Text key="cdn.delete_question" value={full_path} /></p>
</Confirmation>

<style lang="scss">
	p {
		padding: 0 0 var(--padding-2x);
	}
</style>
