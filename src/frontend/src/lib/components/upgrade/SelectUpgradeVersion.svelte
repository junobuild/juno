<script lang="ts">
	import { isNullish } from '@dfinity/utils';
	import { checkUpgradeVersion } from '@junobuild/admin';
	import { onMount, type Snippet } from 'svelte';
	import CanisterUpgradeOptions from '$lib/components/canister/CanisterUpgradeOptions.svelte';
	import IconWarning from '$lib/components/icons/IconWarning.svelte';
	import Html from '$lib/components/ui/Html.svelte';
	import Info from '$lib/components/ui/Info.svelte';
	import { downloadWasm } from '$lib/services/upgrade/upgrade.services';
	import { wizardBusy } from '$lib/stores/busy.store';
	import { i18n } from '$lib/stores/i18n.store';
	import { toasts } from '$lib/stores/toasts.store';
	import type { Wasm } from '$lib/types/upgrade';
	import { i18nFormat } from '$lib/utils/i18n.utils';
	import { last } from '$lib/utils/utils';

	interface Props {
		currentVersion: string;
		newerReleases: string[];
		segment: 'satellite' | 'mission_control' | 'orbiter';
		back?: boolean;
		intro?: Snippet;
		takeSnapshot: boolean;
		onclose: () => void;
		onback: () => void;
		onnext: (params: { steps: 'review' | 'error' | 'download'; wasm?: Wasm }) => void;
	}

	let {
		currentVersion,
		newerReleases,
		segment,
		back = false,
		takeSnapshot = $bindable(true),
		intro,
		onnext,
		onclose,
		onback
	}: Props = $props();

	let selectedVersion: string | undefined = $state(undefined);

	onMount(() => (selectedVersion = last(newerReleases)));

	const onSubmit = async ($event: SubmitEvent) => {
		$event.preventDefault();

		if (isNullish(selectedVersion)) {
			toasts.error({
				text: $i18n.errors.upgrade_download_error
			});

			onnext({ steps: 'error' });

			return;
		}

		// If there is a single newer release then it can be upgraded because all previous versions have been upgraded iteratively.
		const { canUpgrade } =
			newerReleases.length === 1
				? { canUpgrade: true }
				: checkUpgradeVersion({ currentVersion, selectedVersion });

		if (!canUpgrade) {
			toasts.error({
				text: i18nFormat($i18n.errors.upgrade_requires_iterative_version, [
					{
						placeholder: '{0}',
						value: segment.replace('_', ' ')
					},
					{
						placeholder: '{1}',
						value: currentVersion
					},
					{
						placeholder: '{2}',
						value: selectedVersion
					}
				])
			});

			onnext({ steps: 'error' });

			return;
		}

		wizardBusy.start();

		onnext({ steps: 'download' });

		try {
			const wasm = await downloadWasm({ segment, version: selectedVersion });

			onnext({ steps: 'review', wasm });
		} catch (err: unknown) {
			toasts.error({
				text: $i18n.errors.upgrade_download_error,
				detail: err
			});

			onnext({ steps: 'error' });
		}

		wizardBusy.stop();
	};
</script>

{@render intro?.()}

<form onsubmit={onSubmit}>
	{#if newerReleases.length > 1}
		<p>
			<Html
				text={i18nFormat($i18n.canisters.upgrade_note, [
					{
						placeholder: '{0}',
						value: `${newerReleases.length}`
					},
					{
						placeholder: '{1}',
						value: segment.replace('_', ' ')
					},
					{
						placeholder: '{2}',
						value: segment.replace('_', ' ')
					}
				])}
			/>
		</p>
	{/if}

	<Info><Html text={$i18n.canisters.upgrade_breaking_change} /></Info>

	<p>
		<Html
			text={i18nFormat($i18n.canisters.upgrade_description, [
				{
					placeholder: '{0}',
					value: segment.replace('_', ' ')
				},
				{
					placeholder: '{1}',
					value: selectedVersion ?? ''
				}
			])}
		/>
	</p>

	<CanisterUpgradeOptions bind:takeSnapshot />

	<div class="toolbar">
		{#if back}
			<button type="button" onclick={onback}>{$i18n.core.back}</button>
		{:else}
			<button type="button" onclick={onclose}>{$i18n.core.cancel}</button>
		{/if}
		<button type="submit" disabled={isNullish(selectedVersion)}>{$i18n.core.continue}</button>
	</div>
</form>
