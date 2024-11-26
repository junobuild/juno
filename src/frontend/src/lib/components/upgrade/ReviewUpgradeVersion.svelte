<script lang="ts">
	import { isNullish } from '@dfinity/utils';
	import { type UpgradeCodeParams, UpgradeCodeProgress } from '@junobuild/admin';
	import Html from '$lib/components/ui/Html.svelte';
	import { wizardBusy } from '$lib/stores/busy.store';
	import { i18n } from '$lib/stores/i18n.store';
	import { toasts } from '$lib/stores/toasts.store';
	import type { Wasm } from '$lib/types/upgrade';
	import { emit } from '$lib/utils/events.utils';
	import { i18nFormat } from '$lib/utils/i18n.utils';

	interface Props {
		upgrade: ({
			wasmModule
		}: Pick<UpgradeCodeParams, 'wasmModule' | 'onProgress'>) => Promise<void>;
		segment: 'satellite' | 'mission_control' | 'orbiter';
		wasm: Wasm | undefined;
		nextSteps: (
			steps: 'init' | 'confirm' | 'download' | 'review' | 'in_progress' | 'ready' | 'error'
		) => void;
		onclose: () => void;
		onProgress: (progress: UpgradeCodeProgress | undefined) => void;
	}

	let { upgrade, segment, wasm, nextSteps, onProgress, onclose }: Props = $props();

	const onSubmit = async ($event: SubmitEvent) => {
		$event.preventDefault();

		onProgress(undefined);

		if (isNullish(wasm)) {
			toasts.error({
				text: $i18n.errors.upgrade_no_wasm
			});

			nextSteps('error');

			return;
		}

		wizardBusy.start();

		nextSteps('in_progress');

		try {
			const wasmModule = new Uint8Array(await wasm.wasm.arrayBuffer());

			await upgrade({ wasmModule, onProgress });

			emit({ message: 'junoReloadVersions' });

			// Small delay to ensure junoReloadVersions is emitted
			setTimeout(() => {
				nextSteps('ready');

				wizardBusy.stop();
			}, 500);
		} catch (err: unknown) {
			toasts.error({
				text: $i18n.errors.upgrade_error,
				detail: err
			});

			nextSteps('error');

			wizardBusy.stop();
		}
	};
</script>

<h2>{$i18n.canisters.review_upgrade}</h2>

{#if isNullish(wasm)}
	<p>{$i18n.errors.upgrade_no_wasm}</p>

	<div class="toolbar">
		<button onclick={() => nextSteps('init')}>{$i18n.core.back}</button>
	</div>
{:else}
	<form onsubmit={onSubmit}>
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
			<button type="button" onclick={onclose}>{$i18n.core.cancel}</button>
			<button type="submit">{$i18n.core.submit}</button>
		</div>
	</form>
{/if}

<style lang="scss">
	.confirm {
		line-break: anywhere;
	}
</style>
