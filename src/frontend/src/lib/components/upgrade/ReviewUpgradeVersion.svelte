<script lang="ts">
	import type { Wasm } from '$lib/types/upgrade';
	import { i18n } from '$lib/stores/i18n.store';
	import { isNullish } from '$lib/utils/utils';
	import { createEventDispatcher } from 'svelte';
	import { i18nFormat } from '$lib/utils/i18n.utils';
	import { toasts } from '$lib/stores/toasts.store';
	import { wizardBusy } from '$lib/stores/busy.store';
	import {emit} from "$lib/utils/events.utils";

	export let upgrade: ({ wasm_module }: { wasm_module: Uint8Array }) => Promise<void>;
	export let segment: 'satellite' | 'mission_control';
	export let wasm: Wasm | undefined;

	const dispatch = createEventDispatcher();

	const onSubmit = async () => {
		if (isNullish(wasm)) {
			toasts.error({
				text: $i18n.errors.upgrade_no_wasm
			});

			dispatch('junoNext', 'error');

			return;
		}

		wizardBusy.start();

		dispatch('junoNext', 'in_progress');

		try {
			const wasm_module = new Uint8Array(await wasm.wasm.arrayBuffer());

			await upgrade({ wasm_module });

			emit({ message: 'junoReloadVersions' });

			dispatch('junoNext', 'ready');
		} catch (err: unknown) {
			toasts.error({
				text: $i18n.errors.upgrade_error,
				detail: err
			});

			dispatch('junoNext', 'error');
		}

		wizardBusy.stop();
	};
</script>

<h2>{$i18n.canisters.review_upgrade}</h2>

{#if isNullish(wasm)}
	<p>{$i18n.errors.upgrade_no_wasm}</p>

	<div class="toolbar">
		<button on:click={() => dispatch('junoNext', 'init')}>{$i18n.core.back}</button>
	</div>
{:else}
	<form on:submit|preventDefault={onSubmit}>
		<p class="confirm">
			{@html i18nFormat($i18n.canisters.confirm_upgrade, [
				{
					placeholder: '{0}',
					value: segment.replace('_', ' ')
				},
				{
					placeholder: '{1}',
					value: wasm.hash
				}
			])}
		</p>

		<div class="toolbar">
			<button type="button" on:click={() => dispatch('junoClose')}>{$i18n.core.cancel}</button>
			<button type="submit">{$i18n.core.submit}</button>
		</div>
	</form>
{/if}

<style lang="scss">
	.confirm {
		line-break: anywhere;
	}
</style>
