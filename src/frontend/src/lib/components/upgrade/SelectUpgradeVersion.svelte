<script lang="ts">
	import { preventDefault } from 'svelte/legacy';

	import { isNullish } from '@dfinity/utils';
	import { checkUpgradeVersion } from '@junobuild/admin';
	import { createEventDispatcher, onMount } from 'svelte';
	import IconWarning from '$lib/components/icons/IconWarning.svelte';
	import Html from '$lib/components/ui/Html.svelte';
	import { downloadWasm } from '$lib/services/upgrade.services';
	import { wizardBusy } from '$lib/stores/busy.store';
	import { i18n } from '$lib/stores/i18n.store';
	import { toasts } from '$lib/stores/toasts.store';
	import { i18nFormat } from '$lib/utils/i18n.utils';
	import { last } from '$lib/utils/utils';

	interface Props {
		currentVersion: string;
		newerReleases: string[];
		segment: 'satellite' | 'mission_control' | 'orbiter';
		back?: boolean;
		intro?: import('svelte').Snippet;
	}

	let { currentVersion, newerReleases, segment, back = false, intro }: Props = $props();

	let selectedVersion: string | undefined = $state(undefined);

	onMount(() => (selectedVersion = last(newerReleases)));

	const dispatch = createEventDispatcher();

	const onSelect = async () => {
		if (isNullish(selectedVersion)) {
			toasts.error({
				text: $i18n.errors.upgrade_download_error
			});

			dispatch('junoNext', { steps: 'error' });

			return;
		}

		const { canUpgrade } = checkUpgradeVersion({ currentVersion, selectedVersion });

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

			dispatch('junoNext', { steps: 'error' });

			return;
		}

		wizardBusy.start();

		dispatch('junoNext', { steps: 'download' });

		try {
			const wasm = await downloadWasm({ segment, version: selectedVersion });

			dispatch('junoNext', { steps: 'review', wasm });
		} catch (err: unknown) {
			toasts.error({
				text: $i18n.errors.upgrade_download_error,
				detail: err
			});

			dispatch('junoNext', { steps: 'error' });
		}

		wizardBusy.stop();
	};
</script>

{@render intro?.()}

<form onsubmit={preventDefault(onSelect)}>
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

	<p class="warning">
		<IconWarning />
		<Html text={$i18n.canisters.upgrade_breaking_change} />
	</p>

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

	<div class="toolbar">
		{#if back}
			<button type="button" onclick={() => dispatch('junoBack')}>{$i18n.core.back}</button>
		{:else}
			<button type="button" onclick={() => dispatch('junoClose')}>{$i18n.core.cancel}</button>
		{/if}
		<button type="submit" disabled={isNullish(selectedVersion)}>{$i18n.core.continue}</button>
	</div>
</form>

<style lang="scss">
	@use '../../styles/mixins/info';

	.warning {
		@include info.warning;

		margin: var(--padding-2x) 0;
	}
</style>
