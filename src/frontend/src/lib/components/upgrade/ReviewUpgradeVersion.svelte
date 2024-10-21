<script lang="ts">
	import { isNullish } from '@dfinity/utils';
	import { createEventDispatcher } from 'svelte';
	import Html from '$lib/components/ui/Html.svelte';
	import { wizardBusy } from '$lib/stores/busy.store';
	import { i18n } from '$lib/stores/i18n.store';
	import { toasts } from '$lib/stores/toasts.store';
	import type { Wasm } from '$lib/types/upgrade';
	import { emit } from '$lib/utils/events.utils';
	import { i18nFormat } from '$lib/utils/i18n.utils';

	export let upgrade: ({ wasm_module }: { wasm_module: Uint8Array }) => Promise<void>;
	export let segment: 'satellite' | 'mission_control' | 'orbiter';
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

			// Small delay to ensure junoReloadVersions is emitted
			setTimeout(() => {
				dispatch('junoNext', 'ready');

				wizardBusy.stop();
			}, 500);
		} catch (err: unknown) {
			toasts.error({
				text: $i18n.errors.upgrade_error,
				detail: err
			});

			dispatch('junoNext', 'error');

			wizardBusy.stop();
		}
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
			<Html
				text={i18nFormat($i18n.canisters.confirm_upgrade, [
					{
						placeholder: '{0}',
						value: segment.replace('_', ' ')
					},
					{
						placeholder: '{1}',
						value: wasm.hash
					}
				])}
			/>
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
