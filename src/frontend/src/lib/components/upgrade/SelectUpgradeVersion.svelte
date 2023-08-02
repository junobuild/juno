<script lang="ts">
	import { i18n } from '$lib/stores/i18n.store';
	import {
		checkUpgradeVersion,
		type GitHubRelease,
		mapPromptReleases,
		type NewerReleasesAssetKey,
		type PromptReleases
	} from '@junobuild/admin';
	import { createEventDispatcher, onMount } from 'svelte';
	import { isNullish, last } from '$lib/utils/utils';
	import { toasts } from '$lib/stores/toasts.store';
	import { coerce } from 'semver';
	import { i18nFormat } from '$lib/utils/i18n.utils';
	import { wizardBusy } from '$lib/stores/busy.store';

	export let currentVersion: string;
	export let newerReleases: GitHubRelease[];
	export let assetKey: NewerReleasesAssetKey;

	let promptReleases: PromptReleases[] = [];
	let selectedVersion: string | undefined = undefined;

	onMount(() => {
		promptReleases = mapPromptReleases({ githubReleases: newerReleases, assetKey });
		selectedVersion = last(promptReleases)?.title;
	});

	const dispatch = createEventDispatcher();

	const onSelect = async () => {
		if (isNullish(selectedVersion)) {
			toasts.error({
				text: $i18n.errors.upgrade_download_error
			});
			return;
		}

		const release = promptReleases.find(({ title }) => title === selectedVersion);

		if (isNullish(release)) {
			toasts.error({
				text: $i18n.errors.upgrade_no_asset_for_version
			});
			return;
		}

		const { value: asset } = release;

		const userVersion = coerce(asset.name)?.format();

		if (isNullish(userVersion)) {
			toasts.error({
				text: $i18n.errors.upgrade_no_asset_for_version_extract
			});
			return;
		}

		const { canUpgrade } = checkUpgradeVersion({ currentVersion, selectedVersion });

		if (!canUpgrade) {
			toasts.error({
				text: i18nFormat($i18n.errors.upgrade_requires_iterative_version, [
					{
						placeholder: '{0}',
						value: assetKey.replace('_', ' ')
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
			return;
		}

		wizardBusy.start();
		dispatch('junoNext', 'download');

		try {
			dispatch('junoNext', 'review');
		} catch (err: unknown) {
			toasts.error({
				text: $i18n.errors.upgrade_download_error,
				detail: err
			});

			dispatch('junoNext', 'error');
		}

		wizardBusy.stop();
	};
</script>

<slot name="intro" />

<form on:submit|preventDefault={onSelect}>
	<div class="container">
		{#each promptReleases as prompt, i}
			<label>
				<input
					type="radio"
					bind:group={selectedVersion}
					name="selectedVersion"
					value={prompt.title}
				/>
				<span>{prompt.title}</span>
			</label>
		{/each}
	</div>

	<button type="submit" disabled={newerReleases.length === 0}>{$i18n.core.continue}</button>
</form>

<style lang="scss">
  .container {
    display: flex;
    flex-direction: column;
    padding: 0 0 var(--padding-2x);
  }
</style>
