<script lang="ts">
	import Confirmation from '$lib/components/app/core/Confirmation.svelte';
	import IconDelete from '$lib/components/icons/IconDelete.svelte';
	import Html from '$lib/components/ui/Html.svelte';
	import { authIdentity } from '$lib/derived/auth.derived';
	import { deleteWasmAssets } from '$lib/services/satellite/functions/cdn.services';
	import { busy } from '$lib/stores/app/busy.store';
	import { i18n } from '$lib/stores/app/i18n.store';
	import type { Satellite } from '$lib/types/satellite';

	interface Props {
		satellite: Satellite;
		reload: () => void;
	}

	let { satellite, reload }: Props = $props();

	let visible = $state(false);

	const openDelete = () => (visible = true);
	const close = () => (visible = false);

	const deleteAssets = async () => {
		busy.start();

		const result = await deleteWasmAssets({
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

<button class="menu" onclick={openDelete} type="button"
	><IconDelete size="20px" /> {$i18n.cdn.clear_cdn}</button
>

<Confirmation onno={close} onyes={deleteAssets} bind:visible>
	{#snippet title()}
		{$i18n.cdn.clear_cdn}
	{/snippet}

	<p><Html text={$i18n.cdn.clear_cdn_question} /></p>
</Confirmation>

<style lang="scss">
	p {
		font-weight: initial;
		padding: 0 0 var(--padding-2x);
	}
</style>
