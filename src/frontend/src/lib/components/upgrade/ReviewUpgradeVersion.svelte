<script lang="ts">
	import { isNullish } from '@dfinity/utils';
	import { type UpgradeCodeParams, type UpgradeCodeProgress } from '@junobuild/admin';
	import Html from '$lib/components/ui/Html.svelte';
	import { wizardBusy } from '$lib/stores/busy.store';
	import { i18n } from '$lib/stores/i18n.store';
	import { toasts } from '$lib/stores/toasts.store';
	import type { Wasm } from '$lib/types/upgrade';
	import { emit } from '$lib/utils/events.utils';
	import { i18nFormat } from '$lib/utils/i18n.utils';
	import { loadSnapshots } from '$lib/services/snapshots.services';
	import { authStore } from '$lib/stores/auth.store';
	import type { Principal } from '@dfinity/principal';

	interface Props {
		upgrade: ({
			wasmModule
		}: Pick<UpgradeCodeParams, 'wasmModule' | 'onProgress' | 'takeSnapshot'>) => Promise<void>;
		segment: 'satellite' | 'mission_control' | 'orbiter';
		wasm: Wasm | undefined;
		nextSteps: (
			steps: 'init' | 'confirm' | 'download' | 'review' | 'in_progress' | 'ready' | 'error'
		) => void;
		onclose: () => void;
		onProgress: (progress: UpgradeCodeProgress | undefined) => void;
		takeSnapshot: boolean;
		canisterId: Principal;
	}

	let { upgrade, segment, wasm, takeSnapshot, canisterId, nextSteps, onProgress, onclose }: Props =
		$props();

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

			await upgrade({ wasmModule, takeSnapshot, onProgress });

			if (takeSnapshot) {
				await loadSnapshots({
					canisterId,
					identity: $authStore.identity,
					reload: true
				});
			}

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
		<p>
			<Html
				text={i18nFormat($i18n.canisters.upgrade_sha, [
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

		<p>
			{takeSnapshot
				? $i18n.canisters.confirm_upgrade_with_backup
				: $i18n.canisters.confirm_upgrade_without_backup}
		</p>

		<div class="toolbar">
			<button type="button" onclick={onclose}>{$i18n.core.cancel}</button>
			<button type="submit">{$i18n.canisters.upgrade}</button>
		</div>
	</form>
{/if}
